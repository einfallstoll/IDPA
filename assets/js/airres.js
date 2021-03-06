/*jslint browser: true, plusplus: false*/
/*global $, Snap, console*/

function AirResContext(canvas, dom) {
    'use strict';
    
    this.context = canvas;
    this.domContext = dom;
    
    this.config = {
        grid: {
            margin: 60,
            stroke: '#EEE',
            darkStroke: '#000',
            strokeWidth: 2
        },
        path: {
            stroke: '#444',
            strokeWidth: 2
        },
        axis: {
            xAxis: 'X',
            yAxis: 'Y',
            size: 10
        },
        cross: {
            stroke: '#000'
        },
        locationLabel: {
            size: 10,
            margin: 3
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
    
    this.axisUnits = {
        x: 'X',
        y: 'Y'
    };
    
    return this;
}

AirResContext.prototype.drawAxisLabels = function(xLabel, yLabel) {
    // If the axis are already drawn, remove them
    if (this.axisLabels) {
        this.axisLabels.remove();
    }
    
    // Create a group for both axis
    this.axisLabels = this.context.g();
    
    // Save the unit of the axis
    var unitRegex = /.+\[(.+)\]/
    
    if (unitRegex.test(xLabel)) {
        this.axisUnits.x = RegExp.$1;
    }
    
    if (unitRegex.test(yLabel)) {
        this.axisUnits.y = RegExp.$1;
    }
    
    // Save the height and width of the DOM object of the canvas
    var height = this.domContext.height() - 2 * this.config.grid.margin,
        width = this.domContext.width() - 2 * this.config.grid.margin;
    
    // Draw the label for the y-axis
    var yAxisLabel = this.context.text(0, 0, yLabel),
        yAxisLabelBox = yAxisLabel.getBBox();
    
    // Rotate and transform the label for the y-axis
    yAxisLabel.transform('R270,T' + -(yAxisLabelBox.width / 2 - yAxisLabelBox.height / 2) + ',' + (height / 2 + this.config.grid.margin));
    
    // Add the label to the axis-label group
    this.axisLabels.add(yAxisLabel);
    
    // Draw the label for the y-axis
    var xAxisLabel = this.context.text(0, 0, xLabel),
        xAxisLabelBox = xAxisLabel.getBBox();
    
    // Rotate and transform the label for the y-axis
    xAxisLabel.transform('T' + (this.config.grid.margin + width / 2 - xAxisLabelBox.width / 2) + ',' + (this.domContext.height() - xAxisLabelBox.height));
    
    // Add the label to the axis-label group
    this.axisLabels.add(xAxisLabel);
};

AirResContext.prototype.setBoundings = function (xMin, xMax, yMin, yMax) {
    'use strict';
    
    // Save the boundings
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
    
    // If the axis are already drawn, remove them
    if (this.axis) {
        this.axis.remove();
    }
    
    // Don't draw axis if no data is shown
    if (xMax === 0 || yMax === 0) {
        return;   
    }
    
    // Create a group for both axis
    this.axis = this.context.g();
    
    // Create a group for both the x- and the y-axis
    var xAxis = this.context.g(),
        yAxis = this.context.g();
    
    // Calculate the range for the axis
    var xRange = xMax - xMin,
        yRange = yMax - yMin;
    
    // Save the height and width of the DOM object of the canvas
    var height = this.domContext.height() - 2 * this.config.grid.margin,
        width = this.domContext.width() - 2 * this.config.grid.margin,
        gridHeight = height / this.verticalSegments,
        gridWidth = width / this.horizontalSegments;
    
    for (var i = 0; i <= this.verticalSegments; i++) {
        // Calculate the value for the next axis step
        var value = ((yRange / this.verticalSegments) * (this.verticalSegments - i)).toFixed(1);
        
        // Calculate the points for vertical grid
        var x = this.config.grid.margin - this.config.grid.strokeWidth / 2 - 5,
            y = this.config.grid.margin + i * gridHeight - 5;
        
        // Draw the value text
        var valueText = this.context.text(x, y, value);
        
        // Resize the font
        valueText.attr({
            'font-size': this.config.axis.size
        });
        
        // Get the bounding box
        var valueTextBox = valueText.getBBox();
        
        // Transform value text to be left from the axis
        valueText.transform('T' + -valueTextBox.width + ',' + (valueTextBox.height / 2));
        
        // Add the value text to the x-axis group
        yAxis.add(valueText);
    }
    
    for (var i = 0; i <= this.horizontalSegments; i++) {
        // Calculate the value for the next axis step
        var value = ((xRange / this.horizontalSegments) * i).toFixed(1);
        
        // Calculate the points for vertical grid
        var x = this.config.grid.margin + i * gridWidth,
            y = this.config.grid.margin + height + this.config.grid.strokeWidth / 2;
        
        // Draw the value text
        var valueText = this.context.text(x, y, value);
        
        // Resize the font
        valueText.attr({
            'font-size': this.config.axis.size
        });
        
        // Get the bounding box
        var valueTextBox = valueText.getBBox();
        
        // Transform value text to be left from the axis
        valueText.transform('T' + -(valueTextBox.width / 2) + ',' + valueTextBox.height);
        
        // Add the value text to the x-axis group
        xAxis.add(valueText);
    }
    
    // Add the x- and the y-axis to the axis-group
    this.axis.add(xAxis);
    this.axis.add(yAxis);
};

AirResContext.prototype.drawGrid = function (hSegments, vSegments) {
    'use strict';
    
    // If either the horizontal or the vertical segments are undefined, throw an error
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
        
        // Calculate the points for horizontal grid
        var x1 = this.config.grid.margin - this.config.grid.strokeWidth / 2,
            y1 = this.config.grid.margin + i * gridHeight,
            x2 = this.config.grid.margin + width + this.config.grid.strokeWidth / 2,
            y2 = this.config.grid.margin + i * gridHeight;
        
        // Draw a horizontal line
        var horizontalLine = this.context.line(x1, y1, x2, y2);
        
        // If it's the last horizontal line, it's the axis, so make it darker
        if (i === vSegments) {
            horizontalLine.attr({
                stroke: this.config.grid.darkStroke
            });
        }
        
        // Add the horizontal line to the grid
        this.grid.add(horizontalLine);
    }
    
    for (var i = 0; i <= hSegments; i++) {
        
        // Calculate the points for vertical grid
        var x1 = this.config.grid.margin + i * gridWidth,
            y1 = this.config.grid.margin - this.config.grid.strokeWidth / 2,
            x2 = this.config.grid.margin + i * gridWidth,
            y2 = this.config.grid.margin + height + this.config.grid.strokeWidth / 2;
        
        // Draw vertical line
        var verticalLine = this.context.line(x1, y1, x2, y2);
        
        // If it's the first vertical line, it's the axis, so make it darker
        if (i === 0) {
            verticalLine.attr({
                stroke: this.config.grid.darkStroke
            });
        }
        
        // Add the vertical line to the grid
        this.grid.add(verticalLine);
    }
    
    // Set the attributes for the grid
    this.grid.attr({
        stroke: this.config.grid.stroke,
        strokeWidth: this.config.grid.strokeWidth
    });
    
    // Save the context for closure
    var _this = this;
    
    // Display location box
    this.context.mousemove(function(event) {
        // Scope the function to call it in a new this-context
        (function() {
            // Normalize the x- and y-coordinates
            var x = event.offsetX - this.config.grid.margin,
                y = event.offsetY - this.config.grid.margin
            
            // Draw cross and location if within the grid, otherwise remove them
            if (
                x >= 0 &&
                x <= width &&
                y >= 0 &&
                y <= height
            ) {
                
                // If no location saved yet, create a new object for it
                if (!this.location) {
                    this.location = {};
                }
                
                // Save the coordinates
                this.location.x = x;
                this.location.y = y;
                
                // If the cross was already drawn, remove it
                if (this.location.cross) {
                    this.location.cross.remove();
                }
                
                // Create a new group for the cross
                this.location.cross = this.context.g();
                
                // Draw both, the horizontal and the vertical line
                this.location.cross.add(this.context.line(this.config.grid.margin + x, this.config.grid.margin, this.config.grid.margin + x, this.config.grid.margin + height));
                this.location.cross.add(this.context.line(this.config.grid.margin, this.config.grid.margin + y, this.config.grid.margin + width, this.config.grid.margin + y));
            
                // Apply some attributes to it
                this.location.cross.attr({
                    stroke: this.config.cross.stroke,
                    strokeWidth: 1
                });
                
                // If the location labels are already drawn, remove them
                if (this.location.label) {
                    this.location.label.remove();
                }
                
                // Create a new group for the location labels
                this.location.label = this.context.g();
                
                // Calculate the range of the x- and y-axis
                var xRange = this.boundings.x.max - this.boundings.x.min,
                    yRange = this.boundings.y.max - this.boundings.y.min;
                
                // Create both location labels
                var xLabel = this.context.text(this.config.grid.margin + x, this.config.grid.margin + y, (xRange / width * x).toFixed(1) + ' ' + this.axisUnits.x),
                    yLabel = this.context.text(this.config.grid.margin + x, this.config.grid.margin + y, (yRange / height * (height - y)).toFixed(1) + ' ' + this.axisUnits.y);
                
                // Add the location labels to the previously created group
                this.location.label.add(xLabel);
                this.location.label.add(yLabel);
            
                // Move the labels around, according to their own size
                xLabel.transform('T' + -(xLabel.getBBox().width + this.config.locationLabel.margin) + ',' + -this.config.locationLabel.margin);
                yLabel.transform('T' + -(yLabel.getBBox().width + this.config.locationLabel.margin) + ',' + -(xLabel.getBBox().height + this.config.locationLabel.margin));
            } else {
                // Remove the cross only, if it's already drawn
                if (this.location.cross) {
                    this.location.cross.remove();
                }
                
                // Remove the location labels only, if they're already drawn
                if (this.location.label) {
                    this.location.label.remove();
                }
            }
        }).call(_this)
    });
    
    return this.grid;
};

AirResContext.prototype.drawData = function (xData, yData, color) {
    
    // If the datapoints for x and y does not match, throw an error
    if (xData.length != yData.length) {
        throw new Error('Amount of datapoints for x- and y-axis must match');
    }
    
    // Calculate the height and width of the diagram
    var height = this.domContext.height() - 2 * this.config.grid.margin,
        width = this.domContext.width() - 2 * this.config.grid.margin;
    
    // Initialize the path
    var path = '';
    
    for (var i = 0; i < xData.length; i++) {
        
        // Calculate the x- and y-coordinate for the next datapoint
        var xCoordinate = ((xData[i] - this.boundings.x.min) / (this.boundings.x.max - this.boundings.x.min)) * width + this.config.grid.margin,
            yCoordinate = height - ((yData[i] - this.boundings.y.min) / (this.boundings.y.max - this.boundings.y.min)) * height + this.config.grid.margin;
        
        // If it's the first datapoint, move the path to it using 'M'
        if (i === 0) {
            path += 'M' + (this.config.grid.margin) + ',' + (height + this.config.grid.margin);
        }
        path += 'L';
        
        // Append the datapoint to the path
        path += xCoordinate + ',' + yCoordinate;
    }
    
    // Draw the generated path
    var graph = this.context.path(path);
    
    // Set attributes for the drawn path
    graph.attr({
        stroke: color,
        strokeWidth: this.config.path.strokeWidth,
        'fill-opacity': 0
    });
    
    return graph;
};

$(function () {
    'use strict';
    
    // Get the DOM-Object for the diagram, read the width of the parent and calculate the height
    var domContext = $('#diagram'),
        totalWidth = domContext.closest('div').width(),
        totalHeight = (totalWidth / 16) * 9,
        labels = {
            speed: 'Geschwindigkeit [m/s]',
            path: 'Weg [m]',
            time: 'Zeit [s]'
        },
        graphColors = {
            withoutAirResistance: 'blue',
            approximateAirResistance: 'green',
            withAirResistance: 'red'
        };
    
    // Add the width and height to the diagram
    domContext.attr('width', totalWidth);
    domContext.attr('height', totalHeight);
    
    // Create a new Snap.svg context
    var sCanvas = new Snap('#diagram'),
        context = new AirResContext(sCanvas, domContext);
    
    // Draw the grid
    context.drawGrid(15, 10);
    
    // Read which properties should be shown
    var properties = $('input[name=diagram]:checked').val().split('|'),
        xProperty = properties[1],
        yProperty = properties[0];
    
    // Draw the labels for the axis
    context.drawAxisLabels(labels[xProperty], labels[yProperty]);
    
    // Initialize a place to store all the paths
    var paths = [],
        configurationIsLoading = false;
    
    // Read configuration from the <form>'s
    var readConfiguration = function() {
        return {
            requestID: Math.random(),
            terrain: {
                angle: parseFloat($('input[name=angle]').val()),
                gravitation: parseFloat($('input[name=gravitation]').val()),
                length: parseFloat($('input[name=length]').val()),
            },
            subject: {
                weight: parseFloat($('input[name=weight]').val()),
                area: parseFloat($('input[name=area]').val()),
                cw: parseFloat($('input[name=cw]').val()),
                init_velo: 0,
                force: 0,
            },
            resistance: {
                stationary: parseFloat($('input[name=stationary]').val()),
                underway: 0,
            },
            fluid: {
                density: parseFloat($('input[name=density]').val()),
            },
            points: {
                max: 1000,
                steps: parseFloat($('input[name=steps]').val()),
            }
        };
    },
        redraw = function() {
        
            $('.diagram-container .loading').show();
            
            // Remove all paths on redraw
            paths.forEach(function(path) {
                path.remove();
            });

            // Read input and analyze it
            var input = readConfiguration(),
                result = analyze(input);

            // Read which properties should be shown
            var properties = $('input[name=diagram]:checked').val().split('|'),
                xProperty = properties[1],
                yProperty = properties[0];

            // Draw the labels for the axis
            context.drawAxisLabels(labels[xProperty], labels[yProperty]);
            
            // Initialize min- and max-values
            var xMin = 0,
                xMax = 0,
                yMin = 0,
                yMax = 0;

            // Draw a path for each activated graph
            $('input[name=graphs]').each(function() {
                
                // Map the x-coordinates according to the diagram-type
                var xData = (result[$(this).val()] || []).map(function(obj) {
                    return obj[xProperty];
                });

                // Map the y-coordinates according to the diagram-type
                var yData = (result[$(this).val()] || []).map(function(obj) {
                    return obj[yProperty];
                });

                // Calculate the max-values for the data of the current graph
                var xTempMax = xData[xData.length - 1],
                    yTempMax = yData[yData.length - 1];

                // If the calculated max-values are bigger than the ones before, save them
                if (xTempMax > xMax) xMax = xTempMax;
                if (yTempMax > yMax) yMax = yTempMax;
            });

            // Set the boundings (i.e. min- and max-values)
            context.setBoundings(xMin, xMax, yMin, yMax);

            // If the min- and max-values are not the same, we can draw it
            if (xMin != xMax && yMin != yMax) {
                $('input[name=graphs]:checked').each(function() {
                    
                    // Read the current graph type
                    var graphType = $(this).val();

                    // Map the x-coordinates of the current graphtype using the required property
                    var xData = (result[graphType] || []).map(function(obj) {
                        return obj[xProperty];
                    });

                    // Map the y-coordinates of the current graphtype using the required property
                    var yData = (result[graphType] || []).map(function(obj) {
                        return obj[yProperty];
                    });

                    // Draw the path and push it to the paths-array, so we can remove it on redraw
                    paths.push(context.drawData(xData, yData, graphColors[graphType]));
                });
            }
            
            $('.diagram-container .loading').hide();
        },
        redrawAndResetConfiguration = function() {
            redraw();
            
            // Select 0 if redraw happens and no configuration is loading
            if (!configurationIsLoading) {
                $('select[name=configuration]').val(0);
            }
        };
    
    // If different graphs are required or the diagram type changes, redraw it
    $('input[name=graphs]').change(redraw);
    $('input[name=diagram]').change(redraw);
    
    // If the values change, redraw, too
    $('.configuration-form .form-group input').keyup(redrawAndResetConfiguration);
    $('.configuration-form .pre-defined').change(redrawAndResetConfiguration);
    
    // Redraw the saved configurations
    var showConfigurations = function() {
        
        // Initialize the saved configurations, we don't know yet if we can parse them
        var savedConfigurations = [];
        
        // Try to parse the saved configurations
        try {
            savedConfigurations = JSON.parse(localStorage.configurations);
        }
        
        // If the saved configurations couldn't be read, add examples
        catch(e) {
            savedConfigurations = [{
                name: 'Schlittschuhfahrer auf leichtem Gefälle',
                config: {
                    "terrain": {
                        "angle": 10,
                        "gravitation": 9.798,
                        "length": 1000
                    },
                    "subject": {
                        "weight": 80,
                        "area": 0.66,
                        "cw": 0.78,
                        "init_velo": 0,
                        "force": 0
                    },
                    "resistance": {
                        "stationary": 0.027,
                        "underway": 0
                    },
                    "fluid": {
                        "density": 1.204
                    }
                }
            }, {
                name: 'Mensch fällt von einem hohen Gebäude',
                config: {
                    "terrain": {
                        "angle": 90,
                        "gravitation": 9.798,
                        "length": 750
                    },
                    "subject": {
                        "weight": 80,
                        "area": 0.66,
                        "cw": 0.78,
                        "init_velo": 0,
                        "force": 0
                    },
                    "resistance": {
                        "stationary": 0,
                        "underway": 0
                    },
                    "fluid":{
                        "density": 1.204
                    }
                }
            }];
            
            // Save the example configurations to the localStorage
            localStorage.configurations = JSON.stringify(savedConfigurations);
        }
        
        var createOption = function(text, value) {
            var option = $('<option></option>');
            option.val(value);
            option.text(text);
            option.appendTo($('select[name=configuration]'));
        };
        
        // Remove all options from the configuration-select
        $('select[name=configuration]').empty();
        
        // Create empty option
        createOption('Konfiguration zum Laden auswählen...', 0);
        
        // For all found configurations create an option
        for (var i = 0; i < savedConfigurations.length; i++) {
            createOption(savedConfigurations[i].name, i);
        }
    };
    
    // Show configuration on .ready()
    showConfigurations();
    
    // Save configuration clicked
    $('#save').click(function(e) {
        
        // Prevent the form from reloading the page
        e.preventDefault();
        
        // Initialize the saved configurations, we don't know yet if we can parse them
        var savedConfigurations = [];
        
        // Try to parse the saved configurations
        try {
            savedConfigurations = JSON.parse(localStorage.configurations);
        }
        
        // If the saved configurations couldn't be read... uhm... we'll ignore it
        catch(e) {}
        
        // Push the configuration along its name
        savedConfigurations.push({
            name: $('input[name=configuration]').val(),
            config: readConfiguration()
        });
        
        // Save the configurations to the localStorage
        localStorage.configurations = JSON.stringify(savedConfigurations);
        
        // Hooray, we added a configuration, so reload them to make it visible
        showConfigurations();
    });
    
    // Load configuration changed
    $('select[name=configuration]').change(function(e) {
        
        // Prevent the form from reloading the page
        e.preventDefault();
        
        // Initialize the saved configurations, we don't know yet if we can parse them
        var savedConfigurations = [];
        
        // Try to parse the saved configurations
        try {
            savedConfigurations = JSON.parse(localStorage.configurations);
            
            // Configuration is now loading
            configurationIsLoading = true;
            
            // Read the selected configuration
            var loadedConfiguration = savedConfigurations[$('select[name=configuration]').val()].config;

            // Fill the <form> with the loaded configuration
            for (var section in loadedConfiguration) {
                if (typeof loadedConfiguration[section] === 'object') {
                    for (var name in loadedConfiguration[section]) {
                        $('input[name=' + name + ']').val(loadedConfiguration[section][name]).keyup();
                    }
                }
            }
            
            // Configuration finished loading
            configurationIsLoading = false;
        }
        
        // If the saved configurations couldn't be read... uhm... we'll ignore it
        catch(e) {}
    });
    
    // Load configuration clicked
    $('#delete').click(function(e) {
        
        // Prevent the form from reloading the page
        e.preventDefault();
        
        // Initialize the saved configurations, we don't know yet if we can parse them
        var savedConfigurations = [];
        
        // Try to parse the saved configurations
        try {
            savedConfigurations = JSON.parse(localStorage.configurations);
        }
        
        // If the saved configurations couldn't be read... uhm... we'll ignore it
        catch(e) {}
        
        // Splice the selected configuration out of the the array
        savedConfigurations.splice($('select[name=configuration]').val(), 1);
        
        // Save the configurations to the localStorage
        localStorage.configurations = JSON.stringify(savedConfigurations);
        
        // Boohoo, we removed a configuration, so reload them to make it invisible
        showConfigurations();
    });
});
