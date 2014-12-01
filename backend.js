/*global cosh, tanh, toRadians*/

function getSpeedWithoutAirResistance(f_Res, weight, init_velo, terrain_length, points_max) {
    "use strict";
    var i = 1,
        acceleration = f_Res / weight,
        max_time = (-init_velo / acceleration) + Math.sqrt(init_velo * init_velo + 2 * acceleration * terrain_length / (acceleration * acceleration)),

        res = [];
    res[0] = {};
    res[0].time = 0;
    res[0].speed = init_velo;
    res[0].path = 0;
    for (i; i <= points_max - 1; i = i + 1) {
        res[i] = {};
        res[i].time = max_time / (points_max) * (i + 1);
        res[i].speed = acceleration * res[i].time + init_velo;
        res[i].path = 0.5 * acceleration * res[i].time * res[i].time + init_velo * res[i].time;
    }
    res[res.length - 1].path = terrain_length;
    return res;
}

function getSpeedApproximateAirResistance(steps, f_Res, wheight, init_velo, terrain_length, area, density, cw, f_Gleit, f_Hangab) {
    "use strict";
    var i = 1,
        acceleration = f_Res / wheight,
        last_velo = init_velo,
        pastPath = 0,
        pastSpeed = 0,
        f_Air = 0,
        res = [];
    res[0] = {};
    res[0].time = 0;
    res[0].speed = init_velo;
    res[0].path = 0;
    do {
        res[i] = {};
        res[i].time = (i + 1) * steps;
        res[i].speed = acceleration * steps + last_velo;
        res[i].path = pastPath + 0.5 * acceleration * steps * steps + last_velo * steps;
        last_velo = res[i].speed;
        f_Air = area * density * cw * res[i].speed * res[i].speed / 2;
        f_Res = f_Hangab - f_Air - f_Gleit;
        acceleration = f_Res / wheight;
        pastPath = res[i].path;
        i = i + 1;
    } while (res[res.length - 1].path < terrain_length);
    res[res.length - 1].path = terrain_length;

    return res;
}

function getWithAirResistance(steps, f_Res, weight, init_velo, area, density, cw, terrain_length) {
    "use strict";
    var i = 1,

        res = [];
    res[0] = {};
    res[0].time = 0;
    res[0].speed = init_velo;
    res[0].path = 0;
    do {
        res[i] = {};
        res[i].time = (i + 1) * steps;
        res[i].speed = init_velo + Math.sqrt(f_Res / (0.5 * area * cw * density)) * tanh(res[i].time * Math.sqrt((f_Res / weight) * 0.5 * area * cw * density / weight));
        res[i].path = weight / (0.5 * area * cw * density) * Math.log(cosh(res[i].time * Math.sqrt((f_Res / weight) * 0.5 * area * cw * density / weight)));
        i = i + 1;
    } while (res[res.length - 1].path < terrain_length);
    res[res.length - 1].path = terrain_length;

    return res;
}

function analyze(requestJSon) {
    "use strict";
    var res = {
            forRequestID: requestJSon.requestID
        },
        f_Gewicht = 0,
        f_Hangab = 0,
        f_Normal = 0,

        f_Haft = 0,
        f_Gleit = 0,

        f_Air = 0,

        f_Res = 0;

    if (!isNaN(requestJSon.terrain.angle) && !isNaN(requestJSon.terrain.gravitation) && !isNaN(requestJSon.terrain.length) && !isNaN(requestJSon.subject.weight) && !isNaN(requestJSon.subject.area) && !isNaN(requestJSon.subject.cw) && !isNaN(requestJSon.subject.init_velo) && !isNaN(requestJSon.subject.force) && !isNaN(requestJSon.resistance.stationary) && !isNaN(requestJSon.resistance.underway) && !isNaN(requestJSon.fluid.density) && !isNaN(requestJSon.points.max) && !isNaN(requestJSon.points.steps)) {
        f_Gewicht = requestJSon.subject.weight * requestJSon.terrain.gravitation; //Gewichtskraft in Newton [N]
        f_Hangab = f_Gewicht * Math.sin(toRadians(requestJSon.terrain.angle)); //Hangabtriebskraft in [N]
        f_Normal = f_Gewicht * Math.cos(toRadians(requestJSon.terrain.angle)); //Normalkraft in [N]

        f_Haft = f_Normal * requestJSon.resistance.stationary; //Haftreibungskraft in [N]
        f_Gleit = f_Normal * requestJSon.resistance.underway; //Gleitreibungskraft in [N]

        f_Air = requestJSon.subject.area * requestJSon.fluid.density * requestJSon.subject.cw * requestJSon.subject.init_velo * requestJSon.subject.init_velo / 2;

        f_Res = f_Hangab - f_Haft;

        if (requestJSon.subject.init_velo > 0 || f_Res > 0) {
            f_Res = f_Hangab - f_Gleit + requestJSon.subject.force;

            res.withoutAirResistance = getSpeedWithoutAirResistance(f_Res, requestJSon.subject.weight, requestJSon.subject.init_velo, requestJSon.terrain.length, requestJSon.points.max);

            f_Res = f_Hangab - f_Air - f_Haft;
            if (f_Res > 0) {
                f_Res = f_Hangab - f_Air - f_Gleit + requestJSon.subject.force;

                res.approximateAirResistance = getSpeedApproximateAirResistance(requestJSon.points.steps, f_Res, requestJSon.subject.weight, requestJSon.subject.init_velo, requestJSon.terrain.length, requestJSon.subject.area, requestJSon.fluid.density, requestJSon.subject.cw, f_Gleit, f_Hangab);

                f_Res = requestJSon.subject.force + f_Hangab - f_Gleit;
                res.withAirResistance = getWithAirResistance(requestJSon.points.steps, f_Res, requestJSon.subject.weight, requestJSon.subject.init_velo, requestJSon.subject.area, requestJSon.fluid.density, requestJSon.subject.cw, requestJSon.terrain.length);
            }
        }
    }
    if (res.approximateAirResistance === null) {
        res.approximateAirResistance = [];
        res.approximateAirResistance = [{
            speed: 0,
            path: 0,
            time: 0
        }];
    }

    if (res.withAirResistance === null) {
        res.withAirResistance = [{
            speed: 0,
            path: 0,
            time: 0
        }];
    }

    if (res.withoutAirResistance === null) {
        res.withoutAirResistance = [{
            speed: 0,
            path: 0,
            time: 0
        }];
    }

    return res;
}