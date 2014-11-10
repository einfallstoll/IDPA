/*jslint browser: true, plusplus: false*/
/*global $, Snap, console*/

function AirResContext(canvas, dom) {
    'use strict';
    
    this.context = canvas;
    this.domContext = dom;
    
    this.config = {
        grid: {
            margin: 30,
            stroke: '#EEE',
            strokeWidth: 2
        },
        path: {
            stroke: '#444',
            strokeWidth: 2
        }
    };
    
    this.horizontalSegments = 0;
    this.verticalSegments = 0;
    
    this.boundings = {
        x: {
            min: 0,
            max: 1
        },
        y: {
            min: 0,
            max: 1
        }
    };
    
    return this;
}

AirResContext.prototype.setBoundings = function (xMin, xMax, yMin, yMax) {
    'use strict';
    
    this.boundings = {
        x: {
            min: xMin,
            max: xMax
        },
        y: {
            min: yMin,
            max: yMax
        }
    };
};

AirResContext.prototype.drawGrid = function (hSegments, vSegments) {
    'use strict';
    
    if (!hSegments || !vSegments) {
        throw new Error('The amount of segments cannot be 0');
    }
    
    // Save the amount of segments
    this.horizontalSegments = hSegments;
    this.verticalSegments = vSegments;
    
    // Create new group for the grid
    this.grid = this.context.g();
    
    // Save the height and width of the DOM object of the canvas
    var height = this.domContext.height() - 2 * this.config.grid.margin,
        width = this.domContext.width() - 2 * this.config.grid.margin,
        gridHeight = height / vSegments,
        gridWidth = width / hSegments;
    
    for (var i = 0; i <= vSegments; i++) {
        
        // Calculate the points for vertical grid
        var x1 = this.config.grid.margin - this.config.grid.strokeWidth / 2,
            y1 = this.config.grid.margin + i * gridHeight,
            x2 = this.config.grid.margin + width + this.config.grid.strokeWidth / 2,
            y2 = this.config.grid.margin + i * gridHeight;
        
        var horizontalLine = this.context.line(x1, y1, x2, y2);
        
        this.grid.add(horizontalLine);
        
    }
    
    for (var i = 0; i <= hSegments; i++) {
        
        // Calculate the points for horizontal grid
        var x1 = this.config.grid.margin + i * gridWidth,
            y1 = this.config.grid.margin - this.config.grid.strokeWidth / 2,
            x2 = this.config.grid.margin + i * gridWidth,
            y2 = this.config.grid.margin + height + this.config.grid.strokeWidth / 2;
        
        var verticalLine = this.context.line(x1, y1, x2, y2);
        
        this.grid.add(verticalLine);
    }
    
    this.grid.attr({
        stroke: this.config.grid.stroke,
        strokeWidth: this.config.grid.strokeWidth
    });
    
    return this.grid;
};

AirResContext.prototype.drawData = function (xData, yData) {
    if (xData.length != yData.length) {
        throw new Error('Amount of datapoints for x- and y-axis must match');
    }
    
    var height = this.domContext.height() - 2 * this.config.grid.margin,
        width = this.domContext.width() - 2 * this.config.grid.margin;
    
    var path = '';
    
    for (var i = 0; i < xData.length; i++) {
        
        var xCoordinate = ((xData[i] - this.boundings.x.min) / (this.boundings.x.max - this.boundings.x.min)) * width + this.config.grid.margin,
            yCoordinate = height - ((yData[i] - this.boundings.y.min) / (this.boundings.y.max - this.boundings.y.min)) * height + this.config.grid.margin;
        
        if (i === 0) {
            path += 'M';
        } else {
            path += 'L';
        }
        
        path += xCoordinate + ',' + yCoordinate;
        
    }
    
    var graph = this.context.path(path);
    graph.attr({
        stroke: this.config.path.stroke,
        strokeWidth: this.config.path.strokeWidth,
        'fill-opacity': 0
    });
    
    return graph;
};

$(function () {
    'use strict';
    
    var domContext = $('#diagram'),
        totalWidth = domContext.closest('div').width(),
        totalHeight = (totalWidth / 16) * 9;
    
    domContext.attr('width', totalWidth);
    domContext.attr('height', totalHeight);
    
    var sCanvas = new Snap('#diagram'),
        context = new AirResContext(sCanvas, domContext);
    
    context.drawGrid(15, 10);
    
    var paths = [];
    
    var redraw = function() {
        
        paths.forEach(function(path) {
            path.remove();
        });
        
        var result = analyze({
            requestID: Math.random(),
            terrain: {
                angle: 15,
                gravitation: 9.81,
                length: 1000,
            },
            subject: {
                weight: 50,
                area: 1,
                cw: 2,
                init_velo: 0,
                force: 0,
            },
            resistance: {
                stationary: 0.027,
                underway: 0.014,
            },
            fluid: {
                density: 1.2041,
            },
            points: {
                max: 100,
                steps: 0.1,
            }
        });

        console.log(result);
        
        var properties = $('input[name=diagram]:checked').val().split('|'),
            xProperty = properties[1],
            yProperty = properties[0];
        
        var xMin = 0,
            xMax = 0,
            yMin = 0,
            yMax = 0;

        $('input[name=graphs]').each(function() {
            var xData = (result[$(this).val()] || []).map(function(obj) {
                return obj[xProperty];
            });

            var yData = (result[$(this).val()] || []).map(function(obj) {
                return obj[yProperty];
            });
            
            var xTempMax = Math.max.apply(null, xData),
                yTempMax = Math.max.apply(null, yData);
            
            if (xTempMax > xMax) xMax = xTempMax;
            if (yTempMax > yMax) yMax = yTempMax;
        });
        
        context.setBoundings(xMin, xMax, yMin, yMax);
        
        if (xMin != xMax && yMin != yMax) {
            $('input[name=graphs]:checked').each(function() {
                var graphType = $(this).val();

                var xData = (result[graphType] || []).map(function(obj) {
                    return obj[xProperty];
                });

                var yData = (result[graphType] || []).map(function(obj) {
                    return obj[yProperty];
                });

                paths.push(context.drawData(xData, yData));
            });
        }
        
    };
    
    $('input[name=graphs]').change(redraw);
    $('input[name=diagram]').change(redraw);
});
