
/*
    json2.js
    2014-02-04

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

function getLayerType(layer) {
    if (layer instanceof AVLayer) {
        return 'AVLayer';
    } else if (layer instanceof TextLayer) {
        return 'TextLayer';
    }
}


function selectedLayersToJSON() {
    //var compObj = {};
    //compObj.layers = [];
    var layers = [];
    var sampleRateSec;

    //Prompt returns a string.
    //sampleRateSec = parseFloat(prompt("How frequently do you want to sample frames (in seconds)?", .1, "Keyframe frequency"));

    //sampleRateSec = .1;

    if (!sampleRateSec || sampleRateSec < 0) {
        sampleRateSec = .1;
    }


    if (app && app.project && app.project.activeItem) {

        //The latest registered time, according to the layers (not the project).
        var comp            = app.project.activeItem,
        endTime             = comp.duration,
        selectedLayers      = comp.selectedLayers,
        layer,
        i, //iterator
        t, //time
        layerObj, //the layer's properties, stored as an object.
        transforms, //A layer's transforms.
        str, //The string we're constructing.
        initObj, //An object's initial state.
        hideAtBeginning, //If an object's inPoint is greater than zero, we need to hide it initially.
        hideAtEnd; //If an object's outPoint doesn't go to the end of the comp, we need to hide it at its outPoint.


         if (selectedLayers) {
            //ar frameRate = comp.frameRate;
            for(i in selectedLayers) {
                layer = selectedLayers[i];
                switch(getLayerType(layer)) {
                    case 'AVLayer':
                    case 'TextLayer':
                        layerObj        = {};
                        layerObj.name   = layer.name;
                        layerObj.width  = layer.width;
                        layerObj.height = layer.height;
                        layerObj.start  = layer.inPoint;
                        layerObj.end    = layer.outPoint;
                        layerObj.transforms = [];

                        for(t = layerObj.start; t <= layerObj.end; t+= sampleRateSec) {
                            t = roundVal(t);
                            transforms = getTransformParams(layer, t);
                            layerObj.transforms.push(transforms);
                        }

                        layers.push(layerObj);
                    break;
                    default:
                        $.writeln('Unknown layer type', layer);
                    break;
                }
            }

            //Compose string from captured data.
            str = "var tl = new TimelineMax({paused:true});\n";
            //Only do this on DOM ready.
            str += "document.addEventListener(\"DOMContentLoaded\", function() {\n";
            str += "TweenMax.defaultOverwrite = 3;\n";
            str += "const t = " + sampleRateSec + "; //Sample rate\n"
            str += "let tt; // Timeline target\n"

            for(i = 0; i < layers.length; i++) {
                layer = layers[i];

                if (!layer.transforms || !layer.transforms.length) {
                    initObj     = {};
                } else {
                    initObj     = layer.transforms[0];
                }

                //first, set the initial properties in frame one.
                initObj.width       = layer.width;
                initObj.height      = layer.height;
                initObj.xPercent    = Math.round((-layer.transforms[0].originX / layer.width) * 100) + '%';
                initObj.yPercent    = Math.round((-layer.transforms[0].originY / layer.height) * 100) + '%';

                if (layer.start > 0) {
                    //Hide this at the beginning.
                    hideAtBeginning = true;
                    layer.transforms[0].display = "none";
                } else {
                    hideAtBeginning = false;
                }

                //This layer does not exist the entire duration of the composition.
                //Hide it when we're done w/ its frames.
                if (layer.end < endTime) {
                    hideAtEnd = true;
                } else {
                    hideAtEnd = false;
                }

                //Clear these out of the object.
                delete initObj.originX;
                delete initObj.originY;
                delete initObj.time;

                str += "/** Tweens for "+layer.name+" **/\n";
                str += "tt = '"+layer.name+"'; //tween target\n";

                //Conform scale-type items to CSS equivalents.
                if (layer.transforms[0].scale !== null) {
                    //Uniform scale.
                    initObj.width = layer.transforms[0].width   = layer.transforms[0].scaleX * layer.width;
                    initObj.height = layer.transforms[0].height  = layer.transforms[0].scaleY * layer.height;
                    delete layer.transforms[0].scale;
                    delete layer.transforms[0].scaleX
                    delete layer.transforms[0].scaleY;
                } else {
                    //Potential non-uniform scale.
                    if (layer.transforms[0].scaleX !== null) {
                        initObj.width = layer.transforms[0].width = layer.transforms[0].scaleX * layer.width;
                        delete layer.transforms[0].scaleX;
                    }
                    if (layer.transforms[0].scaleY !== null) {
                        initObj.height = layer.transforms[0].height  = layer.transforms[0].scaleY * layer.height;
                        delete layer.transforms[0].scaleY;
                    }
                }

//                $.writeln(layer.name, JSON.stringify(initObj));

                str += "TweenMax.set(tt, " + JSON.stringify(initObj) + ");\n";
                str += "tl";

                var tr = layer.transforms[0];

                for(var fr = 1; fr < layer.transforms.length; fr++) {

                    var needsKeyframe   = false;
                    var keyframe        = {};
                    //Loop through each of the properties defined in this frame.
                    //If it has any properties that differ from the frame before it, we need to make a keyframe.
                    for(var k in layer.transforms[fr]) {
                        if ((k != "time" &&
                            k != "originX" &&
                         k != "originY") &&
                          (tr[k] == undefined ||
                           tr[k] != layer.transforms[fr][k])) {
                            needsKeyframe = true;
                            if (k == 'scaleX' || k == 'scaleY' || k =='scale') {
                                //Don't scale.  Set the width/height instead.
                                switch(k) {
                                    case 'scaleX':
                                        keyframe['width'] = layer.transforms[fr][k] * layer.width;
                                    break;
                                    case 'scaleY':
                                        keyframe['height'] = layer.transforms[fr][k] * layer.height;
                                    break;
                                    case 'scale':
                                        keyframe['width'] = layer.transforms[fr][k] * layer.width;
                                        keyframe['height'] = layer.transforms[fr][k] * layer.height;
                                    break;
                                }
                            } else {
                                keyframe[k] = layer.transforms[fr][k];
                            }
                        }
                    }
                    if (needsKeyframe) {
                        //Need to use concurrent mode in TweenMax (https://greensock.com/docs/#/HTML5/All/TweenMax/)
                      //  keyframe.overwrite = 3;
                        //$.writeln("needsKeyframe " + fr +  "\n");
                        if (hideAtBeginning) {
                            keyframe.display = "block";
                            hideAtBeginning = false;
                        }
                        str += ".add( TweenMax.to(tt, t, " + JSON.stringify(keyframe) + "), "+layer.transforms[fr].time+")";
                    }
                    if (fr == layer.transforms.length - 1 && hideAtEnd) {
                        //We're on the last frame of layer.
                        //For some reason, using set or a time of zero hides this @ the beginning.
                        str += "\n.add( TweenMax.to(tt, .0001, " + JSON.stringify({"display":"none"}) + "), "+(layer.transforms[fr].time + sampleRateSec)+")";
                    }

                    if (fr == layer.transforms.length - 1) {
                        str += ";\n";
                    } else if (needsKeyframe) {
                        str += "\n";
                    }


                    tr = layer.transforms[fr];
                }
            }

//            return;

            str += "\n});"


            if (layers.length) {
                //var text = JSON.stringify(compObj, null, 2);
                var file = File.saveDialog("Save output");

                if (file) {
                    file.open('w');
                    var fsName = file.fsName;

                    if (file.write(str) && file.close()) {

                    } else {
                        alert("Error writing to file.");
                    }
                } else {
                    alert("No destination selected. Aborting process.");
                }
            } else {
                alert("No layers were found for conversion.");
            }

        } else {
            alert("No layers selected.\nPlease select layers & re-run script.");
        }
    } else {
        alert("No composition selected.\nPlease select composition & layers & re-run script.");
    }
}


/*--------------------------------------
    Layer props
---------------------------------------*/

function getTransformParams(layer, time){
    var tformList   = layer.Transform;
    time = roundVal(time);
    var props       = {
        time:time
    };

    for(var i=0; i<tformList.numProperties; i++){

        var prop    = tformList.property(i+1);
        var vals    = prop.valueAtTime(time, false)

        switch(prop.name){
            case "Anchor Point":
                props.originX = roundVal(vals[0]);
                props.originY = roundVal(vals[1]);
                if (vals[2]) {
                    props.originZ = roundVal(vals[2]);
                }
            break;
            case "Position":
                props.x = Math.round(vals[0]);
                props.y = Math.round(vals[1]);
                if (vals[2]){
                    props.z = -Math.round(vals[2]);//-roundVal(vals[2]);
                }
                break;
            case "Opacity":
                props.autoAlpha = roundVal(vals / 100);
                break;
            case "Scale":
                props.scaleX = roundVal(vals[0] / 100);
                props.scaleY = roundVal(vals[1] / 100);
                if (vals[2]) {
                    props.scale = roundVal(vals[2] / 100);
                }
                break;
            case "X Rotation":
                props.rotationX = roundVal(vals);
                break;
            case "Y Rotation":
                props.rotationY = roundVal(vals);
                break;
            case "Z Rotation":
                props.rotationZ = roundVal(vals);
                break;
            case "Rotation":
                props.rotationZ  = roundVal(vals);
                break;
        }

    }
    return props;
}

function roundVal(val){
    // Round to 2 decimals.
    val *= 100;
    val = Math.floor(val);
    val /= 100;

    return val;
}


selectedLayersToJSON();
