/*jslint browser: true, plusplus: false*/
/*global $, Snap, console*/

function AirResContext(canvas, dom) {
    'use strict';
    
    this.context = canvas;
    this.domContext = dom;
    
    this.config = {
        grid: {
            margin: 30,
            stroke: Snap.rgb('#444'),
            strokeWidth: 2
        }
    };
    
    this.horizontalSegments = 0;
    this.verticalSegments = 0;
    
    return this;
}

AirResContext.prototype.drawGrid = function (hSegments, vSegments) {
    'use strict';
    
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
};

$(function () {
    'use strict';
    
    var domContext = $('#diagram'),
        totalWidth = domContext.closest('div').width(),
        totalHeight = (totalWidth / 16) * 9;
    
    domContext.attr('width', totalWidth);
    domContext.attr('height', totalHeight);
    
    var sCanvas = new Snap('#diagram'),
        xData = [
            1.5,
            7.8
        ],
        yData = [
            3.7,
            9.4
        ],
        xMin = 0,
        xMax = Math.max.apply(null, xData),
        yMin = 0,
        yMax = Math.min.apply(null, yData),
        context = new AirResContext(sCanvas, domContext);
    
    context.drawGrid(15, 10);
});
