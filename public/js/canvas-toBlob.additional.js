// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString(svgNode) {
    svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
    var cssStyleText = getCSSStyles(svgNode);
    appendCSS(cssStyleText, svgNode);

    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

    return svgString;

    function getCSSStyles(parentElement) {
        var selectorTextArr = [];

        // Add Parent element Id and Classes to the list
        selectorTextArr.push('#' + parentElement.id);
        for (var c = 0; c < parentElement.classList.length; c++)
            if (!contains('.' + parentElement.classList[c], selectorTextArr))
                selectorTextArr.push('.' + parentElement.classList[c]);

            // Add Children element Ids and Classes to the list
        var nodes = parentElement.getElementsByTagName("*");
        for (var i = 0; i < nodes.length; i++) {
            var id = nodes[i].id;
            if (!contains('#' + id, selectorTextArr))
                selectorTextArr.push('#' + id);

            var classes = nodes[i].classList;
            for (var c = 0; c < classes.length; c++)
                if (!contains('.' + classes[c], selectorTextArr))
                    selectorTextArr.push('.' + classes[c]);
        }

        // Extract CSS Rules
        var extractedCSSText = "";
        for (var i = 0; i < document.styleSheets.length; i++) {
            var s = document.styleSheets[i];

            try {
                if (!s.cssRules) continue;
            } catch (e) {
                if (e.name !== 'SecurityError') throw e; // for Firefox
                continue;
            }

            var cssRules = s.cssRules;
            for (var r = 0; r < cssRules.length; r++) {
                if (contains(cssRules[r].selectorText, selectorTextArr))
                    extractedCSSText += cssRules[r].cssText;
            }
        }


        return extractedCSSText;

        function contains(str, arr) {
            return arr.indexOf(str) === -1 ? false : true;
        }

    }

    function appendCSS(cssText, element) {
        var styleElement = document.createElement("style");
        styleElement.setAttribute("type", "text/css");
        styleElement.innerHTML = cssText;
        var refNode = element.hasChildNodes() ? element.children[0] : null;
        element.insertBefore(styleElement, refNode);
    }
}


function svgString2Image(svgString, width, height, format, callback) {
    var format = format ? format : 'image/png';

    var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    var image = new Image();
    image.onload = function() {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob(function(blob) {
            var filesize = Math.round(blob.length / 1024) + ' KB';
            if (callback) callback(blob, filesize);
        });


    };

    image.src = imgsrc;
}

function save(dataBlob, filesize) {
    saveAs(dataBlob, 'graph_' + Date.now()); // FileSaver.js function
}


(function(global, $) {
    function convertToPdf(svg, callback) {
        // Call svgAsDataUri from saveSvgAsPng.js
        window.svgAsDataUri(svg, {}, function(svgUri) {
            // Create an anonymous image in memory to set 
            // the png content to
            var $image = $('<img>'),
                image = $image[0];

            // Set the image's src to the svg png's URI
            image.src = svgUri;
            $image
                .on('load', function() {
                    // Once the image is loaded, create a canvas and
                    // invoke the jsPDF library
                    var canvas = document.createElement('canvas'),
                        ctx = canvas.getContext('2d'),
                        doc = new jsPDF('landscape', 'pt', 'a2'), //portrait
                        imgWidth = image.width,
                        imgHeight = image.height;

                    // Set the canvas size to the size of the image
                    canvas.width = imgWidth;
                    canvas.height = imgHeight;

                    // Draw the image to the canvas element
                    ctx.drawImage(image, 0, 0, imgWidth, imgHeight);

                    // Add the image to the pdf
                    var dataUrl = canvas.toDataURL('image/jpeg');
                    doc.addImage(dataUrl, 'JPEG', 0, 0, imgWidth, imgHeight);

                    callback(doc);
                });
        });
    }

    function downloadPdf(fileName, pdfDoc) {
        // Dynamically create a link
        var $link = $('<a>'),
            link = $link[0],
            dataUriString = pdfDoc.output('dataurlstring');

        // On click of the link, set the HREF and download of it
        // so that it behaves as a link to a file
        $link.on('click', function() {
            link.href = dataUriString;
            link.download = fileName;
            $link.detach(); // Remove it from the DOM once the download starts
        });

        // Add it to the body and immediately click it
        $('body').append($link);
        $link[0].click();
    }

    // Export this mini-library to the global scope
    global.pdflib = global.pdflib || {};
    global.pdflib.convertToPdf = convertToPdf;
    global.pdflib.downloadPdf = downloadPdf;
})(window, window.jQuery);