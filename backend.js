function getSpeedWithoutAirResistance(f_Res, weight, init_velo, terrain_length, points_max) {
    "use strict";
    var i,
        beschleunigung = f_Res / weight,
        max_time = (-init_velo / beschleunigung) + Math.sqrt(init_velo * init_velo + 2 * beschleunigung * terrain_length / (beschleunigung * beschleunigung)),
         
        res = [];
    for (i = 0; i >= points_max - 1; i = i + 1) {
        res[i] = {};
        res[i].time = max_time / (points_max - 1) * (i + 1);
        res[i].speed = beschleunigung * res[i].time + init_velo;
        res[i].path = 0.5 * beschleunigung * res[i].time * res[i].time + init_velo * res[i].time;
    }
    return res;
}

function analyze(requestJSon) {
    "use strict";
    var res = {forRequestID : requestJSon.requestID},
        f_Gewicht = requestJSon.subject.weight * requestJSon.terrain.gravitation, //Gewichtskraft in Newton [N]
        f_Hangab = f_Gewicht * Math.sin(requestJSon.terrain.angle), //Hangabtriebskraft in [N]
        f_Normal = f_Gewicht * Math.cos(requestJSon.terrain.angle), //Normalkraft in [N]
    
        f_Haft = f_Normal * requestJSon.resistance_stationary, //Haftreibungskraft in [N]
        f_Gleit = f_Normal * requestJSon.resistance_underway,//Gleitreibungskraft in [N]
    
        f_Res = f_Haft - f_Hangab;
    
    if (requestJSon.subject.init_velo > 0 || f_Res > 0) {
        f_Res = f_Gleit - f_Hangab;
        
        res.withoutAirResistance = getSpeedWithoutAirResistance(f_Res, requestJSon.subject.weight, requestJSon.subject.init_velo, requestJSon.terrain.length, requestJSon.points.max);
        
    } else {
        res.withoutAirResistance = [{speed: 0, path: 0, time: 0}];
    }
}