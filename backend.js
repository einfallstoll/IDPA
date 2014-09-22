function toRadians(angle) {
    "use strict";
    return angle * (Math.PI / 180);
}

function getSpeedWithoutAirResistance(f_Res, weight, init_velo, terrain_length, points_max) {
    "use strict";
    var i,
        acceleration = f_Res / weight,
        max_time = (-init_velo / acceleration) + Math.sqrt(init_velo * init_velo + 2 * acceleration * terrain_length / (acceleration * acceleration)),

        res = [];
    for (i = 0; i >= points_max - 1; i = i + 1) {
        res[i] = {};
        res[i].time = max_time / (points_max - 1) * (i + 1);
        res[i].speed = acceleration * res[i].time + init_velo;
        res[i].path = 0.5 * acceleration * res[i].time * res[i].time + init_velo * res[i].time;
    }
    return res;
}

function getSpeedApproximateAirResistance(steps, f_Res, wheight, init_velo, terrain_length, area, density, cw, f_Gleit, f_Hangab) {
    "use strict";
    var i = 0,
        acceleration = f_Res / wheight,
        pastPath = 0,
        f_Air = 0,
        res = [];
    do {
        res[i] = {};
        res[i].time = (i + 1) * steps;
        res[i].speed = acceleration * res[i].time + init_velo;
        res[i].path = pastPath + 0.5 * acceleration * steps * steps + init_velo * steps;

        init_velo = res[i].speed;
        f_Air = area * density * cw * res[i].speed * res[i].speed / 2;
        f_Res = f_Hangab - f_Air - f_Gleit;
        acceleration = f_Res / wheight;
        pastPath = res[i].path;
        i = i + 1;

    } while (res[res.length].path >= terrain_length);
    res[res.length].path = terrain_length;

    return res;
}

function analyze(requestJSon) {
    "use strict";
    var res = {
            forRequestID: requestJSon.requestID
        },
        f_Gewicht = requestJSon.subject.weight * requestJSon.terrain.gravitation, //Gewichtskraft in Newton [N]
        f_Hangab = f_Gewicht * Math.sin(toRadians(requestJSon.terrain.angle)), //Hangabtriebskraft in [N]
        f_Normal = f_Gewicht * Math.cos(toRadians(requestJSon.terrain.angle)), //Normalkraft in [N]

        f_Haft = f_Normal * requestJSon.resistance.stationary, //Haftreibungskraft in [N]
        f_Gleit = f_Normal * requestJSon.resistance.underway, //Gleitreibungskraft in [N]

        f_Air = requestJSon.subject.area * requestJSon.fluid.density * requestJSon.subject.cw * requestJSon.subject.init_velo * requestJSon.subject.init_velo / 2,

        f_Res = f_Hangab - f_Haft;

    if (requestJSon.subject.init_velo > 0 || f_Res > 0) {
        f_Res = f_Hangab - f_Gleit;

        res.withoutAirResistance = getSpeedWithoutAirResistance(f_Res, requestJSon.subject.weight, requestJSon.subject.init_velo, requestJSon.terrain.length, requestJSon.points.max);

        f_Res = f_Hangab - f_Air - f_Haft;
        if (f_Res > 0) {
            f_Res = f_Hangab - f_Air - f_Gleit;

            res.approximateAirResistance = getSpeedApproximateAirResistance(requestJSon.points.steps, f_Res, requestJSon.subject.weight, requestJSon.subject.init_velo, requestJSon.terrain.length, requestJSon.subject.area, requestJSon.fluid.density, requestJSon.fluid.resistancy, f_Gleit, f_Hangab);
        } else {
            res.approximateAirResistance = [{
                speed: 0,
                path: 0,
                time: 0
            }];
        }
    } else {
        res.withoutAirResistance = [{
            speed: 0,
            path: 0,
            time: 0
        }];
    }

    return res;
}