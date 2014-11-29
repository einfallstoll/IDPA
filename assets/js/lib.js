function tanh(x) {
    "use strict";
    if (x === Infinity || Infinity === Math.exp(x)) {
        return 1;
    } else if (x === -Infinity || -Infinity === Math.exp(-x)) {
        return -1;
    } else {
        return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
    }
}

function cosh(x) {
    "use strict";
    return (Math.exp(x) + Math.exp(-x)) / 2;
}

function toRadians(angle) {
    "use strict";
    return angle * (Math.PI / 180);
}