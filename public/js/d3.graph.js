;
(function (d3, $, window, document) {
  'use strict';
  String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };

  // function getRandomInt(min, max) {
  //     return Math.floor(Math.random() * (max - min)) + min;
  // }

  // color_convert//https://bl.ocks.org/njvack/02ad8efcb0d552b0230d

  (function ($, undefined) {
    $.fn.getCursorPosition = function () {
      var el = $(this).get(0);
      var pos = 0;
      if ('selectionStart' in el) {
        pos = el.selectionStart;
      } else if ('selection' in document) {
        el.focus();
        var Sel = document.selection.createRange();
        var SelLength = document.selection.createRange().text.length;
        Sel.moveStart('character', -el.value.length);
        pos = Sel.text.length - SelLength;
      }
      return pos;
    }

    $.fn.selectRange = function (start, end) {
      if (end === undefined) {
        end = start;
      }
      return this.each(function () {
        if ('selectionStart' in this) {
          this.selectionStart = start;
          this.selectionEnd = end;
        } else if (this.setSelectionRange) {
          this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
          var range = this.createTextRange();
          range.collapse(true);
          range.moveEnd('character', end);
          range.moveStart('character', start);
          range.select();
        }
      });
    };

    $.fn.enlargeTextArea = function () { //http://jsfiddle.net/pupunzi/MAjQp/
      return this.each(function () {
        // console.log("enlargeTextArea");
        var el = $(this);
        var elP = el.parent();
        var elH = el.outerHeight();
        el.css({
          overflow: "hidden"
        });

        function manageTextarea() {
          el.css({
            height: elH,
            overflow: "hidden"
          });
          elP.css({
            height: elH
          });
          var nH = el.get(0).scrollHeight;
          nH = nH > elH ? nH : elH;
          el.css({
            height: nH,
            overflow: "hidden"
          });
          elP.css({
            height: nH
          });
        }

        el.bind("keydown", function () {
          manageTextarea(this);
        }).trigger("keydown");

      });
    };
  })(jQuery);



  function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  function getBrowserName() {
    var name = "Unknown";
    if (navigator.userAgent.indexOf("MSIE") != -1) {
      name = "MSIE";
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
      name = "Firefox";
    } else if (navigator.userAgent.indexOf("Opera") != -1) {
      name = "Opera";
    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
      name = "Chrome";
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
      name = "Safari";
    }
    return name;
  }

  function isMicrosoft() {
    if (/MSIE 10/i.test(navigator.userAgent)) {
      // This is internet explorer 10
      return true; // window.alert('isIE10');
    }
    if (/MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent)) {
      // This is internet explorer 9 or 11
      return true; // window.location = 'pages/core/ie.htm';
    }
    if (/Edge\/\d./i.test(navigator.userAgent)) {
      // This is Microsoft Edge
      return true; // window.alert('Microsoft Edge');
    }
    return false;
  }

  function selectTextareaLine(tarea, lineNum) {
    // lineNum--; // array starts at 0
    // var lines = tarea.value.split("\n");

    // calculate start/end
    var startPos = 0, endPos = tarea.value.length;
    // for(var x = 0; x < lines.length; x++) {
    //     if(x == lineNum) {
    //         break;
    //     }
    //     startPos += (lines[x].length+1);

    // }

    // var endPos = lines[lineNum].length+startPos;

    // do selection
    // Chrome / Firefox

    if(typeof(tarea.selectionStart) != "undefined") {
        tarea.focus();
        tarea.selectionStart = startPos;
        tarea.selectionEnd = endPos;
        return true;
    }

    // IE
     if (document.selection && document.selection.createRange) {
        tarea.focus();
        tarea.select();
        var range = document.selection.createRange();
        range.collapse(true);
        range.moveEnd("character", endPos);
        range.moveStart("character", startPos);
        range.select();
        return true;
    }

    return false;
}

  window.graph = {};
  graph.h = (window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight) - 65;
  graph.w = window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  graph.mainContainer = d3.select("#main-container");
  graph.mousedownNode = null;
  graph.mouseupNode = null;
  graph.id = "#d3-graph-wrapper";
  graph.width = 1000;
  graph.isZoom = true;
  graph.height = 500;
  var wrapper = d3.select(graph.id);
  graph.width = wrapper.node().offsetWidth;
  graph.height = wrapper.node().offsetHeight;
  graph.themes = null;
  graph.contextMenuPosition = {
    x: 0,
    y: 0
  };
  graph.sessionStorageIndex = 0;
  graph.margin = {
    top: 0,
    right: 0,
    bottom: 50,
    left: 0
  };
  graph.parameters = {};
  graph.firstLoad = "true";
  graph.zoom = null;
  graph.fixedVerticalGapFeedback = [];
  graph.keyPress = false;
  graph.quality = 2;
  graph.imageSize = 16;
  graph.imageOpacity = 0.02;
  graph.imageOpacityLink = 0.2;
  graph._imageFill = "black";
  graph.parameters.isGraphPermalink = false;
  graph.parameters.isLinkAnimation = false;
  graph.parameters.backgroundColour = $("#parameter-background-colour").val();
  graph.parameters.verticalGap = 30;
  graph.parameters.horizontalGap = 50;

  graph.parameters.groupColour = $("#parameter-group-colour").val();
  graph.parameters.groupBorderColour = $("#parameter-group-border-colour").val();
  graph.parameters.groupTextColour = $("#parameter-group-text-colour").val();
  graph.parameters.groupBorderWidth = +d3.select("#parameter-group-border-width-value").text();
  graph.parameters.groupOpacity = (100 - (+d3.select("#parameter-group-opacity-value").text())) / 100;
  graph.parameters.groupTextSize = +d3.select("#parameter-group-text-size-value").text();

  graph.parameters.nodeWidth = +d3.select("#parameter-node-width-value").text();
  graph.parameters.nodeColour = $("#parameter-node-colour").val();
  graph.parameters.nodeBorderColour = $("#parameter-node-border-colour").val();
  graph.parameters.nodeTextColour = $("#parameter-group-text-colour").val();
  graph.parameters.nodeBorderWidth = +d3.select("#parameter-node-border-width-value").text();
  graph.parameters.nodeOpacity = (100 - (+d3.select("#parameter-node-opacity-value").text())) / 100;
  graph.parameters.nodeTextSize = +d3.select("#parameter-node-text-size-value").text();

  graph.parameters.linkBorderColour = $("#parameter-link-border-colour").val();
  graph.parameters.linkBorderWidth = +d3.select("#parameter-link-border-width-value").text();
  graph.parameters.linkTextColour = $("#parameter-link-text-colour").val();
  graph.parameters.linkTextSize = +d3.select("#parameter-link-text-size-value").text();
  graph.parameters.strokeDasharray = {}; //"strokeDasharray": "solid" //solid, dotted, dashed
  graph.parameters.strokeDasharray.solid = "none";
  graph.parameters.strokeDasharray.dotted = "2,3";
  graph.parameters.strokeDasharray.dashed = "6,3";


  graph.parameters.titleName = "";
  graph.parameters.titleTextColour = "#000000";
  graph.parameters.titleTextSize = 24;
  graph.parameters.titleTextAnchor = "middle";
  graph.parameters.titleTextOpacity = 1;
  d3.select("#parameter-title-name").property("value", graph.parameters.titleName)
    .on("keyup", function () {
      graph.parameters.titleName = d3.select(this).property("value");
      d3.select("#graph-title").text(graph.parameters.titleName);
    });


  graph.initState = {};
  graph.colors = ["7F2704", "67000D", "08306B", "00441B", "3F007D", "000000",
    "D94801", "CB181D", "2171B5", "238B45", "6A51A3", "525252",
    "FD8D3C", "FB6A4A", "6BAED6", "74C476", "9E9AC8", "969696",
    "FDD0A2", "FCBBA1", "C6DBEF", "C7E9C0", "DADAEB", "D9D9D9",
    "FFF5EB", "FFF5F0", "F7FBFF", "F7FCF5", "FCFBFD", "FFFFFF"
  ];
  graph.markerSize = 4.5;
  graph.colorsColumn = 6;
  graph.selectedNodes = [];
  graph.selectedGroups = [];
  graph.selectedLinks = [];

  var h = (window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight) - 60;
  var w = (window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth);

  d3.select("#d3-graph-container").style("height", h + "px");


  $(document).ready(function () {
    if (w > 700) {
      $("#display-help-cont").empty().load("help.html");
    } else {
      $("#display-help-cont").empty().load("help.html").css("height", h - 10);
    }

    if (!localStorage.getItem('theorymakerFirstLoad')) {
      $("#display-help").toggleClass('position-left-0');
      $("#help-ico").toggleClass('d3-hidden');
      $("#help-close-ico").toggleClass('d3-hidden');
      localStorage.setItem('theorymakerFirstLoad', graph.firstLoad);
    }

  });

  $("#theorymaker-info").click(function () {
    window.open("http://theorymaker.info", "_self");
  });


  $("#bt-help").click(function () {
    $("#display-help").toggleClass('position-left-0');
    $("#help-ico").toggleClass('d3-hidden');
    $("#help-close-ico").toggleClass('d3-hidden');
  });

  $("#bt-list").click(function () {
    $("#list-ico").toggleClass('d3-hidden');
    $("#list-close-ico").toggleClass('d3-hidden');
    var isVisible = $("#list-ico").hasClass('d3-hidden');
    if (isVisible) {
      // or https://jsfiddle.net/ywaoec3d/2/
      vex.dialog.open({
        cssClass: 'gallety-contaoner',
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, {
            text: '  X'
          })
        ],
        afterClose: function () {
          $("#list-ico").toggleClass('d3-hidden');
          $("#list-close-ico").toggleClass('d3-hidden');
        },
        afterOpen: function () { //http://github.hubspot.com/vex/api/advanced/
          var xButton = '<svg><g id="help-close-ico" class="d3-hidden"><rect class="pulsate" x="17" y="9.5" transform="matrix(0.7071 0.7071 -0.7071 0.7071 18.0002 -7.4559)" width="2" height="17"></rect><rect class="pulsate" x="9.5" y="17" transform="matrix(0.7071 0.7071 -0.7071 0.7071 18.0002 -7.4559)" width="17" height="2"></rect></g></svg>';
          var arr = ["default", "IFRC_no_boxes", "IFRC", "IFRC2", "flow"];
          var vex = d3.select(".vex-content")
            .style("width", (graph.width - 112) + "px")
            .style("max-height", (graph.height - 100) + "px");
          d3.select(".vex-dialog-form")
            .style("max-height", (graph.height - 130) + "px");

          vex.select(".vex-dialog-buttons")
            .style("position", "absolute")
            .style("top", "0px")
            .style("right", "-52px")
            .style("width", "42px")
            .style("height", "42px")
            .insert("div", ".vex-dialog-button-primary").html(xButton);
          var galleryContainer = vex.select(".vex-dialog-input")
            .style("overflow-x", "hidden")
            .append("div").attr("class", "hovergallery")
            .append("div").attr("class", "row");
          arr.map(function (d, i) {
            // console.log(d);
            $.ajax({
              type: 'POST',
              url: "./loadimage",
              datatype: "json",
              data: {
                permalink: d
              },
              success: function (result) {
                galleryContainer
                  .append("a").attr("href", "#")
                  .on("click", function () {
                    window.location.search = setParameterByName("", "permalink", d);
                    getData(d);
                  })
                  .append("div").attr("class", "col-md-4 col-sm-6").style("height", "180px").style("overflow", "hidden")
                  .append("div").attr("class", "text").text(d.replaceAll('_', " "))
                  .append("img").attr("src", "data:image/png;base64," + result).style("max-height", "100%").style("max-width", "100%");
              },
              error: function () {
                //console.log("Error!"); 
              }
            });
          });
        }
      });
    }
  });

  $("#bt-settings").click(function () {
    $("#display-settings").toggleClass('position-right-0');
    $("#settings-ico").toggleClass('d3-hidden');
    $("#settings-close-ico").toggleClass('d3-hidden');
  });



  $(".get-data").click(function () {
    var permalink = $(this).html();
    window.location.search = setParameterByName("", "permalink", permalink);
    getData(permalink);
  });


  function toogleVariblePanel(active, partId) {
    var height = $(partId + "-content>div").height() + 15;
    $(partId + "-content").css("height", height + "px");
    var duration = 500;
    if (active) {
      $(partId + "-label span").addClass('glyphicon-menu-down').removeClass('glyphicon-menu-right');
      $(partId + "-label").addClass('active');
      $(partId + "-content").removeClass('collapsed')
    } else {
      $(partId + "-label span").removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
      $(partId + "-label").removeClass('active');
      $(partId + "-content").addClass('collapsed')
    }
  }

  $("#variable-panel-label").click(function () {
    var active = $(this).hasClass('active');
    toogleVariblePanel(!active, "#variable-panel");
    active = false;
    toogleVariblePanel(active, "#group-panel");
    toogleVariblePanel(active, "#arrow-panel");
    toogleVariblePanel(active, "#diagram-panel");
    toogleVariblePanel(active, "#save-panel");
  });
  $("#group-panel-label").click(function () {
    var active = $(this).hasClass('active');
    toogleVariblePanel(!active, "#group-panel");
    active = false;
    toogleVariblePanel(active, "#variable-panel");
    toogleVariblePanel(active, "#arrow-panel");
    toogleVariblePanel(active, "#diagram-panel");
    toogleVariblePanel(active, "#save-panel");
  });
  $("#arrow-panel-label").click(function () {
    var active = $(this).hasClass('active');
    toogleVariblePanel(!active, "#arrow-panel");
    active = false;
    toogleVariblePanel(active, "#group-panel");
    toogleVariblePanel(active, "#variable-panel");
    toogleVariblePanel(active, "#diagram-panel");
    toogleVariblePanel(active, "#save-panel");
  });
  $("#diagram-panel-label").click(function () {
    var active = $(this).hasClass('active');
    toogleVariblePanel(!active, "#diagram-panel");
    active = false;
    toogleVariblePanel(active, "#group-panel");
    toogleVariblePanel(active, "#arrow-panel");
    toogleVariblePanel(active, "#variable-panel");
    toogleVariblePanel(active, "#save-panel");
  });
  $("#save-panel-label").click(function () {
    var active = $(this).hasClass('active');
    toogleVariblePanel(!active, "#save-panel");
    active = false;
    toogleVariblePanel(active, "#group-panel");
    toogleVariblePanel(active, "#arrow-panel");
    toogleVariblePanel(active, "#diagram-panel");
    toogleVariblePanel(active, "#variable-panel");
  });

  function setGraphParameters(isFromTheme) {
    // for new 
    graph.parameters.isLinkAnimation = graph.parameters.isLinkAnimation === undefined ? false : graph.parameters.isLinkAnimation;
    graph.parameters.isGraphPermalink = graph.parameters.isGraphPermalink === undefined ? false : graph.parameters.isGraphPermalink;
    graph.parameters.titleTextAnchor = graph.parameters.titleTextAnchor === undefined ? "middle" : graph.parameters.titleTextAnchor;
    // console.log(graph.parameters.titleName);
    graph.parameters.titleName = graph.parameters.titleName === undefined ? "" : graph.parameters.titleName;
    graph.parameters.titleTextSize = graph.parameters.titleTextSize === undefined ? 24 : graph.parameters.titleTextSize;
    graph.parameters.titleTextColour = graph.parameters.titleTextColour === undefined ? "#000000" : graph.parameters.titleTextColour;
    graph.parameters.titleTextOpacity = graph.parameters.titleTextOpacity === undefined ? 1 : graph.parameters.titleTextOpacity;
    graph.parameters.graphInfo = graph.parameters.graphInfo === undefined ? "" : graph.parameters.graphInfo;
    graph.parameters.linkTextSize = graph.parameters.linkTextSize === undefined ? 14 : graph.parameters.linkTextSize;

    $("#parameter-background-colour").val(graph.parameters.backgroundColour).css("background", graph.parameters.backgroundColour);
    $("#parameter-group-colour").val(graph.parameters.groupColour).css("background", graph.parameters.groupColour);
    $("#parameter-group-border-colour").val(graph.parameters.groupBorderColour).css("background", graph.parameters.groupBorderColour);
    $("#parameter-group-text-colour").val(graph.parameters.groupTextColour).css("background", graph.parameters.groupTextColour);
    d3.select("#parameter-group-border-width-value").text(graph.parameters.groupBorderWidth);
    d3.select("#parameter-group-opacity-value").text(Math.round(100 - graph.parameters.groupOpacity * 100));
    d3.select("#parameter-group-text-size-value").text(graph.parameters.groupTextSize);

    d3.select("#parameter-node-width-value").text(graph.parameters.nodeWidth);
    $("#parameter-node-colour").val(graph.parameters.nodeColour).css("background", graph.parameters.nodeColour);
    $("#parameter-node-border-colour").val(graph.parameters.nodeBorderColour).css("background", graph.parameters.nodeBorderColour);
    $("#parameter-group-text-colour").val(graph.parameters.nodeTextColour).css("background", graph.parameters.nodeTextColour);
    d3.select("#parameter-node-border-width-value").text(graph.parameters.nodeBorderWidth);
    d3.select("#parameter-node-opacity-value").text(Math.round(100 - graph.parameters.nodeOpacity * 100));
    d3.select("#parameter-node-text-size-value").text(graph.parameters.nodeTextSize);

    $("#parameter-link-border-colour").val(graph.parameters.linkBorderColour).css("background", graph.parameters.linkBorderColour);
    d3.select("#parameter-link-border-width-value").text(graph.parameters.linkBorderWidth);
    $("#parameter-link-text-colour").val(graph.parameters.linkTextColour).css("background", graph.parameters.linkTextColour);
    d3.select("#parameter-link-text-size-value").text(graph.parameters.linkTextSize);
    $("#parameter-is-link-animation").prop("checked", graph.parameters.isLinkAnimation);
    $("#parameter-is-graph-permalink").prop("checked", graph.parameters.isGraphPermalink);


    d3.select("#parameter-title-name").property("value", graph.parameters.titleName);
    d3.select("#parameter-title-text-size-value").text(graph.parameters.titleTextSize);
    $("#parameter-title-text-colour").val(graph.parameters.titleTextColour).css("background", graph.parameters.titleTextColour);

    d3.select("#parameter-graph-info").text(graph.parameters.graphInfo);

    if (graph.initState && graph.initState.links) {
      graph.initState.links.map(function (d) {
        if (graph.parameters.isLinkAnimation) {
          d.strokeWidth = 2.5;
          d.strokeDasharray = "dotted";
        }
      });
    }
  }

  function setTheme() {
    var t = d3.select("#parameter-themes").node().value;
    var theme = graph.themes[t || "default"];
    if (theme) {
      var changeExistingItems = $("#parameter-change-existing-items").prop("checked");
      graph.parameters = theme;
      setGraphParameters();

      if (changeExistingItems) {
        Object.keys(graph.initState.nodes).map(function (objectKey) {
          var node = graph.initState.nodes[objectKey];
          if (node.level === 0) {
            node.fill = graph.parameters.nodeColour;
            node.stroke = graph.parameters.nodeBorderColour;
            node.strokeWidth = graph.parameters.nodeBorderWidth;
            node.width = graph.parameters.nodeWidth;
            node.fontSize = graph.parameters.nodeTextSize;
            node.textFill = graph.parameters.nodeTextColour;
          } else {
            node.fill = graph.parameters.groupColour;
            node.stroke = graph.parameters.groupBorderColour;
            node.strokeWidth = graph.parameters.groupBorderWidth;
            node.fontSize = graph.parameters.groupTextSize;
            node.textFill = graph.parameters.groupTextColour;
          }
        });
        graph.initState.links.map(function (d) {
          d.stroke = graph.parameters.linkBorderColour;
          d.strokeWidth = graph.parameters.linkBorderWidth;
          d.fill = graph.parameters.linkTextColour;
        });
      }

      graph.parameters.titleTextColour = theme.titleTextColour;
      graph.parameters.titleTextSize = theme.titleTextSize;

      $("#diagram-panel-content").removeClass('collapsed');
      $("#variable-panel-content").removeClass('collapsed');
      $("#group-panel-content").removeClass('collapsed');
      $("#arrow-panel-content").removeClass('collapsed');
      $("#save-panel-label").removeClass('collapsed');
      setGlobalPanel(graph);
      $("#diagram-panel-content").addClass('collapsed');
      $("#variable-panel-content").addClass('collapsed');
      $("#group-panel-content").addClass('collapsed');
      $("#arrow-panel-content").addClass('collapsed');
    }
    restartN(1);
  }
  $("#parameter-themes").change(setTheme);
  $("#parameter-is-link-animation").change(function () {
    graph.parameters.isLinkAnimation = $(this).prop("checked");
    graph.initState.links.map(function (d) {
      if (graph.parameters.isLinkAnimation) {
        d.strokeWidth = 2.5;
        d.strokeDasharray = "dotted";
      } else {
        d.strokeDasharray = "solid";
      }
    });
    restartN(1);
  });

  $("#parameter-is-graph-permalink").change(function () {
    graph.parameters.isGraphPermalink = $(this).prop("checked");
    d3.select("#graph-permalink").style("display", graph.parameters.isGraphPermalink ? "block" : "none");
  });

  // $("#parameter-graph-info").on("change input paste keyup", function () {
  //   graph.parameters.graphInfo = $(this).val();
  // });
  $("#parameter-graph-info").on("keyup", function () {
    graph.parameters.graphInfo = $(this).val();
  });

  setGlobalPanel(graph);

  function setGlobalPanel(graph) {

    $("#parameter-background-colour").icolor({
      colors: graph.colors,
      col: graph.colorsColumn,
      autoClose: true,
      onSelect: function (c) {
        graph.parameters.backgroundColour = c;
        $('#parameter-background-colour').css("background", graph.parameters.backgroundColour);
        d3.select("#background-rect").style("fill", graph.parameters.backgroundColour);
        this.$t.val(c);
        this.$tb.css("background-color", c);
        restartN(1); //need for change icons color
      }
    });

    d3.select('#parameter-title-text-size').selectAll("*").remove();
    d3.select('#parameter-title-text-size').call(d3.slider().min(10).value(graph.parameters.titleTextSize).max(50).step(1).on("slide", function (evt, value) { //.axis(true)
      value = Math.round(+value) || 24;
      d3.select('#parameter-title-text-size-value').text(value);
      graph.parameters.titleTextSize = +value;
      restartN(1);
    }));

    $("#parameter-title-text-colour").icolor({
      colors: graph.colors,
      col: graph.colorsColumn,
      autoClose: true,
      onSelect: function (c) {
        graph.parameters.titleTextColour = c;
        $('#parameter-title-text-colour').css("background", graph.parameters.titleTextColour);
        this.$t.val(c);
        this.$tb.css("background-color", c);
        restartN(1); //need for change icons color
      }
    });



    $("#parameter-group-colour").icolor({
      colors: graph.colors,
      col: graph.colorsColumn,
      autoClose: true,
      onSelect: function (c) {
        graph.parameters.groupColour = c;
        $('#parameter-group-colour').css("background", graph.parameters.groupColour);
        d3.selectAll(".group").style("fill", graph.parameters.groupColour);
        var keys = d3.keys(graph.initState.nodes);
        keys.map(function (key) {
          if (graph.initState.nodes[key].level !== 0) {
            graph.initState.nodes[key].fill = c;
          }
        });
        this.$t.val(c);
        this.$tb.css("background-color", c);
      }
    });

    $("#parameter-group-border-colour").icolor({
      colors: graph.colors,
      col: graph.colorsColumn,
      autoClose: true,
      onSelect: function (c) {
        graph.parameters.groupBorderColour = c;
        $('#parameter-group-border-colour').css("background", graph.parameters.groupBorderColour);
        d3.selectAll(".group").style("stroke", graph.parameters.groupBorderColour);
        var keys = d3.keys(graph.initState.nodes);
        keys.map(function (key) {
          if (graph.initState.nodes[key].level > 0) {
            graph.initState.nodes[key].stroke = graph.parameters.groupBorderColour;
          }
        });
        this.$t.val(c);
        this.$tb.css("background-color", c);
      }
    });

    $("#parameter-group-text-colour").icolor({
      colors: graph.colors,
      col: graph.colorsColumn,
      autoClose: true,
      onSelect: function (c) {
        graph.parameters.groupTextColour = c;
        $('#parameter-group-text-colour').css("background", graph.parameters.groupTextColour);
        d3.selectAll(".group-label").style("fill", graph.parameters.groupTextColour);
        this.$t.val(c);
        this.$tb.css("background-color", c);
      }
    });

    d3.select('#parameter-group-text-size').selectAll("*").remove();
    d3.select('#parameter-group-text-size').call(d3.slider().min(10).value(graph.parameters.groupTextSize).max(30).step(1).on("slide", function (evt, value) { //.axis(true)
      value = Math.round(+value);
      d3.select('#parameter-group-text-size-value').text(value);
      graph.parameters.groupTextSize = +value;
      var keys = d3.keys(graph.initState.nodes);
      keys.map(function (key) {
        if (graph.initState.nodes[key].level !== 0) {
          graph.initState.nodes[key].fontSize = graph.parameters.groupTextSize;
        }
      });
      restartN(3);
    }));

    d3.select('#parameter-group-opacity').selectAll("*").remove();
    d3.select('#parameter-group-opacity').call(d3.slider().min(0).value(Math.round(100 - graph.parameters.groupOpacity * 100)).max(100).step(5).on("slide", function (evt, value) { //.axis(true)
      value = Math.round(value);
      graph.parameters.groupOpacity = (100 - value) / 100;
      d3.select('#parameter-group-opacity-value').text(value);
      d3.selectAll(".group").style("fill-opacity", graph.parameters.groupOpacity);
      restartN(1); //need for change icons color
    }));

    d3.select('#parameter-node-width').selectAll("*").remove();
    d3.select('#parameter-node-width').call(d3.slider().min(10).value(graph.parameters.nodeWidth).max(500).step(5).on("slide", function (evt, value) { //.axis(true)
      graph.parameters.nodeWidth = Math.round(value);
      d3.select('#parameter-node-width-value').text(graph.parameters.nodeWidth);
      var keys = d3.keys(graph.initState.nodes);
      keys.map(function (key) {
        if (graph.initState.nodes[key].level === 0) {
          graph.initState.nodes[key].width = graph.parameters.nodeWidth;
        }
      });
      restartN(2);
    }));

    $("#parameter-node-colour").icolor({
      colors: graph.colors,
      col: graph.colorsColumn,
      autoClose: true,
      onSelect: function (c) {
        graph.parameters.nodeColour = c;
        $('#parameter-node-colour').css("background", graph.parameters.nodeColour);
        d3.selectAll(".node").style("fill", graph.parameters.nodeColour);
        var keys = d3.keys(graph.initState.nodes);
        keys.map(function (key) {
          if (graph.initState.nodes[key].level === 0) {
            graph.initState.nodes[key].fill = graph.parameters.nodeColour;
          }
        });
        this.$t.val(c);
        this.$tb.css("background-color", c);
      }
    });

    d3.select('#parameter-node-opacity').selectAll("*").remove();
    d3.select('#parameter-node-opacity').call(d3.slider().min(0).value(Math.round(100 - graph.parameters.nodeOpacity * 100)).max(100).step(5).on("slide", function (evt, value) { //.axis(true)
      value = Math.round(value);
      graph.parameters.nodeOpacity = (100 - value) / 100;
      d3.select('#parameter-node-opacity-value').text(value);
      d3.selectAll(".node").style("fill-opacity", graph.parameters.nodeOpacity);
    }));

    $("#parameter-node-border-colour").icolor({
      colors: graph.colors,
      col: graph.colorsColumn,
      autoClose: true,
      onSelect: function (c) {
        graph.parameters.nodeBorderColour = c;
        $('#parameter-node-border-colour').css("background", graph.parameters.nodeBorderColour);
        d3.selectAll(".node").style("stroke", graph.parameters.nodeBorderColour);
        var keys = d3.keys(graph.initState.nodes);
        keys.map(function (key) {
          if (graph.initState.nodes[key].level === 0) {
            graph.initState.nodes[key].stroke = graph.parameters.nodeBorderColour;
          }
        });
        this.$t.val(c);
        this.$tb.css("background-color", c);
      }
    });

    $("#parameter-node-text-colour").icolor({
      colors: graph.colors,
      col: graph.colorsColumn,
      autoClose: true,
      onSelect: function (c) {
        graph.parameters.nodeTextColour = c;
        $('#parameter-node-text-colour').css("background", graph.parameters.nodeTextColour);
        d3.selectAll(".node-label").style("fill", graph.parameters.nodeTextColour);
        this.$t.val(c);
        this.$tb.css("background-color", c);
      }
    });

    d3.select('#parameter-node-text-size').selectAll("*").remove();
    d3.select('#parameter-node-text-size').call(d3.slider().min(10).value(graph.parameters.nodeTextSize).max(30).step(1).on("slide", function (evt, value) { //.axis(true)
      value = Math.round(+value);
      d3.select('#parameter-node-text-size-value').text(value);
      graph.parameters.nodeTextSize = value;
      var keys = d3.keys(graph.initState.nodes);
      keys.map(function (key) {
        if (graph.initState.nodes[key].level === 0) {
          graph.initState.nodes[key].fontSize = graph.parameters.nodeTextSize;
        }
      });
      restartN(3);
    }));

    d3.select('#parameter-group-border-width').selectAll("*").remove();
    d3.select('#parameter-group-border-width').call(d3.slider().min(0.1).value(graph.parameters.groupBorderWidth).max(9).step(0.1).on("slide", function (evt, value) { //.axis(true)
      graph.parameters.groupBorderWidth = +value.toFixed(1);
      d3.select('#parameter-group-border-width-value').text(graph.parameters.groupBorderWidth);
      d3.selectAll(".group").style("stroke-width", graph.parameters.groupBorderWidth);
    }));

    d3.select('#parameter-node-border-width').selectAll("*").remove();
    d3.select('#parameter-node-border-width').call(d3.slider().min(0.1).value(graph.parameters.nodeBorderWidth).max(9).step(0.1).on("slide", function (evt, value) { //.axis(true)
      graph.parameters.nodeBorderWidth = +value.toFixed(1);
      d3.select('#parameter-node-border-width-value').text(graph.parameters.nodeBorderWidth);
      d3.selectAll(".node").style("stroke-width", graph.parameters.nodeBorderWidth);
    }));

    $("#parameter-link-border-colour").icolor({
      colors: graph.colors,
      col: graph.colorsColumn,
      autoClose: true,
      onSelect: function (c) {
        graph.parameters.linkBorderColour = c;
        $('#parameter-link-border-colour').css("background", graph.parameters.linkBorderColour);
        d3.selectAll(".link").style("stroke", graph.parameters.linkBorderColour);
        graph.initState.links.map(function (link) {
          link.stroke = c;
        });
        this.$t.val(c);
        this.$tb.css("background-color", c);
        restartN(1); //need for arrowhead
      }
    });

    d3.select('#parameter-link-border-width').selectAll("*").remove();
    d3.select('#parameter-link-border-width').call(d3.slider().min(0.1).value(graph.parameters.linkBorderWidth).max(6).step(0.1).on("slide", function (evt, value) { //.axis(true)
      graph.parameters.linkBorderWidth = +value.toFixed(1);
      d3.select('#parameter-link-border-width-value').text(graph.parameters.linkBorderWidth);
      graph.initState.links.map(function (link) {
        link.strokeWidth = graph.parameters.linkBorderWidth;
      });
      restartN(1);
    }));

    $("#parameter-link-text-colour").icolor({
      colors: graph.colors,
      col: graph.colorsColumn,
      autoClose: true,
      onSelect: function (c) {
        graph.parameters.linkTextColour = c;
        $('#parameter-link-text-colour').css("background", graph.parameters.linkTextColour);
        d3.selectAll(".link-label").style("fill", graph.parameters.linkTextColour);
        graph.initState.links.map(function (link) {
          link.fill = c;
        });
        this.$t.val(c);
        this.$tb.css("background-color", c);
        restartN(1);
      }
    });

    d3.select('#parameter-link-text-size').selectAll("*").remove();
    d3.select('#parameter-link-text-size').call(d3.slider().min(10).value(graph.parameters.linkTextSize).max(24).step(1).on("slide", function (evt, value) { //.axis(true)
      value = Math.round(+value);
      d3.select('#parameter-link-text-size-value').text(value);
      graph.parameters.linkTextSize = +value;
      graph.initState.links.map(function (link) {
        link.fontSize = graph.parameters.linkTextSize;
      });
      restartN(1);
    }));
  }

  function setImagesOpacity(opacity) {
    d3.select("#graph-title").style("opacity", graph.parameters.titleTextOpacity);
    d3.selectAll(".node-settings").style("opacity", opacity);
    d3.selectAll(".group-settings").style("opacity", opacity);
    d3.selectAll(".link-settings").style("opacity", opacity > 0 ? graph.imageOpacityLink : opacity);
    d3.selectAll(".node-move").style("opacity", opacity);
    d3.selectAll(".node-movebetweengroups").style("opacity", opacity);
    d3.selectAll(".group-move").style("opacity", opacity);
    d3.selectAll(".node-square").style("opacity", opacity);
  }

  $('#parameter-save').click(function (e) {
    setImagesOpacity(0);
    var parameterForSave = $("#parameter-for-save").val();
    // save as svg - https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an

    var permalink = $("#parameter-permalink-name").val().replace(/[^a-zA-Z0-9_]/g, function (str) {
      return '';
    });

    if (parameterForSave === "pdf") { // http://jsfiddle.net/JehdF/1237/
      var $svg = $('#d3-graph-wrapper svg');
      pdflib.convertToPdf($svg[0], function (doc) {
        // Get the file name and download the pdf
        pdflib.downloadPdf(permalink, doc);
      });
    } else if (parameterForSave === "png" || parameterForSave === "emf") { // http://bl.ocks.org/Rokotyan/0556f8facbaf344507cdc45dc3622177
      if (navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1)) {
        d3.selectAll(".arrow") //arrow-for-save
          .each(function (d) {
            var translateX = 0;
            var translateY = 0;
            var markerSize = Math.round(graph.markerSize + d.strokeWidth);
            if (Math.round(d.sourceY) === Math.round(d.targetY) && d.sourceX < d.targetX) {
              translateX = 0;
              translateY = -markerSize;
            } else if (Math.round(d.sourceY) === Math.round(d.targetY) && d.sourceX > d.targetX) {
              translateX = 0;
              translateY = markerSize;
            } else if (Math.round(d.sourceX) === Math.round(d.targetX) && d.sourceY < d.targetY) {
              translateX = markerSize;
              translateY = 0;
            } else if (Math.round(d.sourceX) === Math.round(d.targetX) && d.sourceY > d.targetY) {
              translateX = -markerSize;
              translateY = 0;
            } else if (d.sourceX > d.targetX && d.sourceY > d.targetY) { //'↑'+'←'
              translateX = -markerSize;
              translateY = markerSize / 2;
            } else if (d.sourceX < d.targetX && d.sourceY > d.targetY) { //'↑'+'→'
              translateX = -markerSize / 2;
              translateY = -markerSize + 1;
            } else if (d.sourceX < d.targetX && d.sourceY < d.targetY) { //'↓'+'→'
              translateX = markerSize / 2;
              translateY = -markerSize;
            } else if (d.sourceX > d.targetX && d.sourceY < d.targetY) { //'↓'+'←'
              translateX = markerSize / 2;
              translateY = markerSize - 1;
            }
            d3.select(this).attr("transform", "translate(" + translateX + ", " + translateY + ")");
          });
        // return;
        saveSvgAsPng(document.querySelector("#d3-graph-wrapper svg"), permalink + "." + parameterForSave, {
          scale: graph.quality,
          canvg: canvg
        });
        d3.selectAll(".arrow").attr("transform", "translate(0, 0)");
      } else {
        saveSvgAsPng(document.querySelector("#d3-graph-wrapper svg"), permalink + "." + parameterForSave, {
          scale: graph.quality
        });
      }
      // Options - https://github.com/exupero/saveSvgAsPng
      // backgroundColor — Creates a PNG with the given background color. Defaults to transparent.
      // left - Specify the viewbox's left position. Defaults to 0.
      // height - Specify the image's height. Defaults to the viewbox's height if given, or the element's non-percentage height, or the element's bounding box's height, or the element's CSS height, or the computed style's height, or 0.
      // scale — Changes the resolution of the output PNG. Defaults to 1, the same dimensions as the source SVG.
      // selectorRemap — A function that takes a CSS selector and produces its replacement in the CSS that's inlined into the SVG. Useful if your SVG style selectors are scoped by ancestor elements in your HTML document.
      // modifyStyle - A function that takes CSS styles and returns replacement styles.
      // top - Specify the viewbox's top position. Defaults to 0.
      // width - Specify the image's width. Defaults to the viewbox's width if given, or the element's non-percentage width, or the element's bounding box's width, or the element's CSS width, or the computed style's width, or 0.
      // encoderType - A DOMString indicating the image format. The default type is image/png.
      // encoderOptions - A Number between 0 and 1 indicating image quality. The default is 0.8
      // canvg - If canvg is passed in, it will be used to write svg to canvas. This will allow support for Internet Explorer
      // var wrapper = d3.select(graph.id);
      // var width = wrapper.node().offsetWidth;
      // var height = wrapper.node().offsetHeight;
      // var svg = wrapper.select('svg');
      // var svgString = getSVGString(svg.node());
      // svgString2Image(svgString, 10 * width, 10 * height, parameterForSave, save); // passes Blob and filesize String to the callback
    }
    setTimeout(function () {
      setImagesOpacity(graph.imageOpacity);
    }, 1500);

  });

  $('#parameter-permalink-name').keyup(function (e) {
    var code = e.keyCode || e.which;
    if (code !== 37 || code !== 39) {
      return;
    }
    $(this).val($(this).val().replace(/[^a-zA-Z0-9_]/g, function (str) {
      return '';
    })); //sanitize
  });

  function closeCanvasContainer(e) {
    d3.select("#thesvg").attr("width", graph.width).attr("height", graph.height);
    d3.select("#background-rect").attr("width", graph.width).attr("height", graph.height);
    d3.select(".main-group").attr("transform", "translate(" + graph.zoom.translate() + ")scale(" + graph.zoom.scale() + ")");
    d3.select("#canvas-container").select("canvas").remove();
    d3.select("#canvas-container").style("display", "none").style("z-index", "-99999");
    d3.select(".dragline").style("opacity", 1);
    d3.select("#graph-title").attr("transform", "translate(0,0)scale(1)").attr('x', graph.width / 2).attr('y', (10 + graph.parameters.titleTextSize));
    d3.select("#graph-permalink").attr("transform", "translate(0,0)scale(1)").attr('x', 0).attr('y', graph.height - 5);
    d3.select(".spinner-wrapper").style("display", "none"); // http://tobiasahlin.com/spinkit/
  }

  $('#close-canvas-container').click(closeCanvasContainer);

  function parameterCreateWebImage(callback) {
    d3.select("#canvas-container").style("background", graph.parameters.backgroundColour);
    d3.select(".dragline").style("opacity", 0);
    var padding = 20;
    d3.select(".main-group").attr("transform", "translate(" + graph.zoom.translate() + ")scale(" + graph.zoom.scale() * graph.quality + ")");
    var bBox = d3.select('.main-group').node().getBBox();
    var boundingClientRect = d3.select('.main-group').node().getBoundingClientRect();
    var t = d3.transform(d3.select('.main-group').attr("transform"));
    d3.select(".main-group").attr("transform", "translate(" + Math.round(t.translate[0] - boundingClientRect.left + 15 + padding) + "," + Math.round(t.translate[1] - boundingClientRect.top + 50 + padding) + ")scale(" + graph.zoom.scale() * graph.quality + ")");
    boundingClientRect = d3.select('.main-group').node().getBoundingClientRect();

    d3.select("#thesvg").attr("width", boundingClientRect.width + padding * 3).attr("height", boundingClientRect.height + padding * 3);
    d3.select("#background-rect").attr("width", boundingClientRect.width + padding * 3).attr("height", boundingClientRect.height + padding * 3);
    d3.select("#graph-title").attr("transform", "translate(0,0)scale(" + graph.zoom.scale() * graph.quality + ")").attr('x', Math.round((boundingClientRect.width + padding * 3) / 2 / graph.quality)).attr('y', (graph.parameters.titleTextSize));
    d3.select("#graph-permalink").attr("transform", "translate(0,0)scale(" + graph.zoom.scale() * graph.quality + ")").attr('x', 0).attr('y', Math.round((boundingClientRect.height + padding * 3 - (5 * graph.quality)) / graph.quality));
    d3.select("#canvas-container").append("canvas").attr("id", "canvas").attr("width", boundingClientRect.width + padding * 3).attr("height", boundingClientRect.height + padding * 3);

    return setTimeout(function () {
      var svgString = new XMLSerializer().serializeToString(document.querySelector('#thesvg'));
      var canvas = document.getElementById("canvas");
      var context = canvas.getContext("2d");
      var DOMURL = self.URL || self.webkitURL || self;
      var img = new Image();
      var svg = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8"
      });
      var url = DOMURL.createObjectURL(svg);
      img.onload = function () {
        context.drawImage(img, 0, 0);
      };
      img.src = url;
      if (callback) {
        callback(context);
      }
    }, 250);
  }


  $('#parameter-save-dataset').click(function (e) { //theorymaker.info/?permalink=MyName


    var permalink = $("#parameter-permalink-name").val().replace(/[^a-zA-Z0-9_]/g, function (str) {
      return '';
    }); // sanitize
    if (permalink === "default" || permalink === "") {
      alert("Please type a different name for saving"); // alert("Permalink name is empty!");
      return;
    }
    d3.select(".spinner-wrapper").style("display", "flex");

    function callback(context) {

      setTimeout(function () {


        var json = {
          "graph": graph.initState,
          "parameters": graph.parameters
        };
        var str = JSON.stringify(json); // window.location.hash = JSON.stringify(graph.initState);
        $.ajax({
          type: 'POST',
          url: "./setdata",
          datatype: "json",
          data: {
            permalink: permalink,
            "graph": str
          },
          success: function (result) {
            $.ajax({
              type: 'POST',
              url: "./saveimage",
              datatype: "json",
              data: {
                permalink: permalink,
                "graph": context.canvas.toDataURL('image/png')
              },
              success: function (result) { //done
                window.location.search = setParameterByName("", "permalink", permalink);
                $("#parameter-permalink-name").val(permalink);
                localStorage.setItem('theorymakerPermalink', permalink);
                $("#saved-link-span").html(window.location.href);
              },
              complete: function () { //always
                closeCanvasContainer();
              }
            });
          },
          error: function () {
            closeCanvasContainer();
          }
        });
      }, 500);
    }
    // new
    parameterCreateWebImage(callback);

  });

  function saveText(text, filename) {
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click();
  }

  $('#parameter-download-dataset').click(function (e) {
    var permalink = $("#parameter-permalink-name").val().replace(/[^a-zA-Z0-9_]/g, function (str) {
      return '';
    }); //sanitize
    if (!permalink) {
      permalink = "default_" + Date.now();
    }
    var json = {
      "graph": graph.initState,
      "parameters": graph.parameters
    };
    var str = JSON.stringify(json);
    saveText(str, permalink + ".json");
    localStorage.setItem("theorymakerState", JSON.stringify(graph.initState));
  });


  $('#parameter-upload-dataset').on('change', function () {
    // https://coligo.io/building-ajax-file-uploader-with-node/
    var files = $(this).get(0).files;
    if (files.length > 0) {
      // create a FormData object which will be sent as the data payload in the
      // AJAX request
      var formData = new FormData();
      // loop through all the selected files and add them to the formData object
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        // add the files to formData object for the data payload
        formData.append('uploads[]', file, file.name);
      }

      $.ajax({
        url: '/upload',
        type: 'POST',
        datatype: "json",
        data: formData,
        processData: false,
        contentType: false,
        success: function (permalink) {
          window.location.search = setParameterByName("", "permalink", permalink);
          getData(permalink);
        },
        error: function () {
          // console.log("Error!"); 
        }
      });

    }
  });


  d3.select('#parameter-quality').call(d3.slider().min(1).value(graph.quality).max(12).step(1).on("slide", function (evt, value) {
    graph.quality = +value;
    d3.select('#parameter-quality-value').text(value);
  }));

  $("#diagram-panel-content").addClass('collapsed');
  $("#variable-panel-content").addClass('collapsed');
  $("#group-panel-content").addClass('collapsed');
  $("#arrow-panel-content").addClass('collapsed');




  graph.rebind = function () {
    var wrapper = d3.select(graph.id);
    var width = wrapper.node().offsetWidth;
    var margin = this.margin;
    var height = wrapper.node().offsetHeight;
    graph.width = width;
    graph.height = height;
    var charge = -200;
    var linkDistance = 140;
    var gravity = 0.00;
    var textLeftPadding = 8;
    var arrowMargin = 1;
    var textHorizontalPadding = 8;
    var force = d3.layout.force()
      .charge(charge)
      .linkDistance(linkDistance)
      .gravity(gravity);
    var currentScale = 1;
    graph.zoom = d3.behavior.zoom()
      .translate([0, 0])
      .scale(currentScale)
      .scaleExtent([0.4, 4]);
    var backgroundNodeAdditionSize = 25;
    var svg;
    var defs;
    var g;
    var groupG;
    var nodeG;
    var linkG;
    var arrowG;
    var gridLineG;
    var dragLine;
    var duration = 0;
    var state = {};
    var backgroundRect;
    var graphTitleText;
    var permalinkOnGraphText;
    var lastNodeXBeforeAddLink, lastNodeYBeforeAddLink;
    var needAddLink = 0;

    function resetMouseVars() {
      graph.mousedownNode = null;
      graph.mouseupNode = null;
    }

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    function onlyUniqueObject(data) {
      data = data.filter(function (d, index, self) {
        return self.findIndex(function (t) {
          return t.source === d.source && t.target === d.target;
        }) === index;
      });
      return data;
    }


    function recursiveDelete(id) {
      var keys = d3.keys(graph.initState.nodes);
      keys.map(function (key) {
        if (graph.initState.nodes[key] && graph.initState.nodes[key].selectedNodes !== undefined) {
          graph.initState.nodes[key].selectedNodes = graph.initState.nodes[key].selectedNodes.filter(function (c) {
            return c !== id;
          });
          graph.initState.links = graph.initState.links.filter(function (c) {
            var flag = ((c.source === graph.initState.nodes[key].id && c.target !== graph.initState.nodes[key].id) || (c.source !== graph.initState.nodes[key].id && c.target === graph.initState.nodes[key].id));
            if (flag) {
              d3.select("#link-label__" + c.id).remove();
            }
            return !flag;
          });
          if (graph.initState.nodes[key].selectedNodes.length === 0) {
            var newId = graph.initState.nodes[key].id;
            graph.initState.nodes[key] = undefined;
            delete graph.initState.nodes[key];
            recursiveDelete(newId);
          }
        }
      });
      graph.initState.links = graph.initState.links.filter(function (c) {
        var flag = ((c.source === id && c.target !== id) || (c.source !== id && c.target === id));
        if (flag) {
          d3.select("#link-label__" + c.id).remove();
        }
        return !flag;
      });
      graph.initState.nodes[id] = undefined;
      delete graph.initState.nodes[id];
    }

    function recursive(data) {
      var nest = d3.nest()
        .key(function (d) {
          return d.x;
        })
        .key(function (d) {
          return d.y;
        })
        .entries(data)
        .sort(function (a, b) {
          return d3.ascending(a.key, b.key);
        });

      nest.map(function (xValues) {
        xValues.values.map(function (yValues) {
          var yLength = yValues.values.length;
          if (yLength > 1) {
            yValues.values[yLength - 1].y = yValues.values[yLength - 1].y + graph.parameters.horizontalGap;
            yValues.values[yLength - 1].py = yValues.values[yLength - 1].py + graph.parameters.horizontalGap;
            recursive(data);
          }
        });
      });
    }

    function recursiveIfNodeOverlaps(data) {
      var nestIfNodeOverlaps = d3.nest()
        .key(function (d) {
          return d.x;
        })
        .entries(data)
        .sort(function (a, b) {
          return d3.ascending(a.key, b.key);
        });
      nestIfNodeOverlaps.map(function (xValues, xI) {
        var xLength = xValues.values.length;
        if (xLength > 1) {
          xValues.values.sort(function (a, b) {
              return d3.ascending(a.y, b.y);
            })
            .map(function (xx, ii) {
              if (ii === 0) {
                return;
              }
              var top = {};
              var bottom = {};
              if (xValues.values[ii - 1].y < xValues.values[ii].y) {
                top = xValues.values[ii - 1];
                bottom = xValues.values[ii];
              } else {
                top = xValues.values[ii];
                bottom = xValues.values[ii - 1];
              }
              // console.log("xLength-1=", (top.y + top.height) > bottom.y && top.y < bottom.y, xValues);
              // console.log("xLength-2=", ((bottom.y - top.y) < bottom.height));
              // var theSameParent = 0;
              if (bottom.fixedVerticalGap && top.fixedVerticalGap) {
                var bottomY = (top.y - top.height / 2) + top.height + 20 + bottom.height / 2; // + (top.isBadgesBar ? graph.imageSize : 0);
                var bottomPY = (top.py - top.height / 2) + top.height + 20 + bottom.height / 2; // + (top.isBadgesBar ? graph.imageSize : 0);
                if (bottom.y === bottomY && bottomPY === bottom.py) {
                  return
                }
                // console.log(state.nodes);
                var isParent = 0;
                state.nodes.map(function (nodeOrGroup) {
                  if (nodeOrGroup.selectedNodes && nodeOrGroup.selectedNodes.length > 0) {
                    // if (theSameParent === 0) {
                    //   theSameParent = 0;
                    //   nodeOrGroup.selectedNodes.map(function(d) {
                    //     if (d == bottom.id){
                    //       theSameParent = theSameParent + 1;
                    //     }
                    //     if (d == top.id){
                    //       theSameParent = theSameParent + 1;
                    //     }
                    //   });
                    // }
                    if (isParent === 2) {
                      return;
                    }
                    isParent = 0;
                    nodeOrGroup.selectedNodes.map(function (d) {
                      if (d == bottom.id) {
                        isParent = isParent + 1;
                      }
                      if (d == top.id) {
                        isParent = isParent + 1;
                      }
                    });
                  }
                });
                if (isParent >= 2 || isParent === 0) {
                  // console.log(bottom, top);
                  bottom.y = bottomY; //top.y + top.height
                  bottom.py = bottomPY;
                  graph.fixedVerticalGapFeedback.push(top);
                  graph.fixedVerticalGapFeedback.push(bottom);
                }
                return;
              }
              if (((top.y + top.height) > bottom.y && top.y < bottom.y) || ((bottom.y - top.y) < bottom.height)) { //?
                bottom.y = bottom.y + graph.parameters.horizontalGap; // + (top.isBadgesBar ? graph.imageSize : 0);
                bottom.py = bottom.py + graph.parameters.horizontalGap; // + (top.isBadgesBar ? graph.imageSize : 0);
                recursiveIfNodeOverlaps(data);
                return;
              }
              // graph.initState.nodes[yValues.values[yLength - 1].id].
              var flagTop = undefined;
              var flagBottom = undefined;
              Object.keys(graph.initState.nodes).map(function (key, index) {
                if (graph.initState.nodes[key].level > 0 && graph.initState.nodes[key].selectedNodes && graph.initState.nodes[key].selectedNodes.length === 1 && graph.initState.nodes[key].selectedNodes[0] === top.id) {
                  flagTop = graph.initState.nodes[key].id;
                }
                if (graph.initState.nodes[key].level > 0 && graph.initState.nodes[key].selectedNodes && graph.initState.nodes[key].selectedNodes.length === 1 && graph.initState.nodes[key].selectedNodes[0] === bottom.id) {
                  flagBottom = graph.initState.nodes[key].id;
                }
              });
              // console.log(flagTop, flagBottom);
              if (flagTop && flagBottom) {
                if (((graph.initState.nodes[flagTop].y + graph.initState.nodes[flagTop].height) > graph.initState.nodes[flagBottom].y && graph.initState.nodes[flagTop].y < graph.initState.nodes[flagBottom].y)) { // || ((graph.initState.nodes[flagBottom].y - graph.initState.nodes[flagTop].y) < graph.initState.nodes[flagBottom].height)
                  // console.log(flagTop, flagBottom, graph.initState.nodes[flagTop].y, graph.initState.nodes[flagTop].height, graph.initState.nodes[flagBottom].y, graph.initState.nodes[flagBottom].height);
                  bottom.y = bottom.y + graph.parameters.horizontalGap;
                  bottom.py = bottom.py + graph.parameters.horizontalGap;
                  graph.initState.nodes[flagBottom].y = graph.initState.nodes[flagBottom].y + graph.parameters.horizontalGap;
                  graph.initState.nodes[flagBottom].py = graph.initState.nodes[flagBottom].py + graph.parameters.horizontalGap;
                  restartN(1);
                }
              }
            });
        }
      });
    }

    graph.zoom.on("zoom", function () {
      if (!graph.isZoom) {
        d3.event.sourceEvent.stopPropagation();
        d3.event.sourceEvent.preventDefault();
        return;
      }
      var currentScale = graph.zoom.scale();
      var currentPosition = graph.zoom.translate();
      g.attr("transform", "translate(" + Math.round(currentPosition[0]) + "," + Math.round(currentPosition[1]) + ")scale(" + graph.zoom.scale() + ")");
      var showLeft = false;
      var showRight = false;
      var showUp = false;
      var showDown = false;
      Object.keys(graph.initState.nodes).map(function (key, index) { // if gtoup has current, need add new in group
        var x;
        var y;
        if (currentScale <= 2) {
          x = graph.initState.nodes[key].x + graph.initState.nodes[key].x * (currentScale - 1); //>1 left
          y = graph.initState.nodes[key].y + graph.initState.nodes[key].y * (currentScale - 1);
          if (x < 0 || (Math.round(currentPosition[0]) + x) < 0) {
            showLeft = true;
          }
          if ((x + graph.initState.nodes[key].width * (currentScale - 1)) > width || (Math.round(currentPosition[0]) + x + graph.initState.nodes[key].width * (currentScale - 1)) > width) {
            showRight = true;
          }
          if (y < 0 || (Math.round(currentPosition[1]) + y) < 0) {
            showUp = true;
          }
          if ((y + graph.initState.nodes[key].height * (currentScale - 1)) > height || (Math.round(currentPosition[1]) + y + graph.initState.nodes[key].height * (currentScale - 1)) > height) {
            showDown = true;
          }
        } else {
          showLeft = true;
          showRight = true;
          showUp = true;
          showDown = true;
        }
      });
      graph.mainContainer.select("#animation-arrow-left").style("display", showLeft ? "inherit" : "none");
      graph.mainContainer.select("#animation-arrow-right").style("display", showRight ? "inherit" : "none");
      graph.mainContainer.select("#animation-arrow-up").style("display", showUp ? "inherit" : "none");
      graph.mainContainer.select("#animation-arrow-down").style("display", showDown ? "inherit" : "none")
      d3.selectAll(".foreign-object").remove();
    });


    // https://swisnl.github.io/jQuery-contextMenu/demo/input.html
    $.contextMenu({
      selector: '.group',
      position: function (opt, x, y) {
        opt.$menu.css({
          top: graph.contextMenuPosition.y + 50,
          left: graph.contextMenuPosition.x + 15
        });
      },
      items: {
        contextMenuTitle: {
          className: 'context-menu-title-wrapper',
          type: "contextMenuTitle",
        },
        edittext: {
          name: "Edit text",
          type: 'textarea',
          className: 'group-textarea-focus',
          height: 80,
          events: {
            keyup: function (e, opt) {
              if ((e.keyCode === 17 && lastLInkKey === 13) || (e.keyCode === 13 && lastLInkKey === 17)) {
                $(".context-menu-list").hide();
                lastLInkKey = e.keyCode;
                restartN(3);
                return;
              }
              // if (e.keyCode === 13 && graph.keyPress) {
              //   $(".context-menu-list").hide();
              //   graph.selectedGroups = [];
              // }
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var name = e.target.value;
              if (e.keyCode === 13) {
                e.target.value = e.target.value + '\n';
                // $(e.target).height(e.target.height + 20);
                name = name + '\n';
              }
              var txt = name.replaceAll('\n', ' /// ');
              // var txt = (frm.select(".makeEditable").node().value).replaceAll('\n', ' /// ');
              txt = txt.trim();

              var bars = {
                "!1": "▂",
                "!2": "▃",
                "!3": "▅",
                "!4": "▆",
                "!5": "▇"
              };
              // also when concatenated only need one “!", e.g. !531 is the same as !5!3!1 
              var words = txt.replaceAll("[A-Za-z]", "").split(" ")
                .filter(function (d) {
                  return (d.indexOf("!") === 0 && (+d.substring(1, d.length)) > 0) && (/^[1-5]+$/.test(d.replaceAll("!", "")));
                })
                .map(function (d) {
                  var numberAsString = d.replaceAll("!", "") + "";
                  var stringArray = numberAsString.split("");
                  var unicodes = "";
                  stringArray.map(function (d) {
                    unicodes = unicodes + bars["!" + d];
                  });
                  txt = txt.replaceAll(d, unicodes);
                });
              txt = txt.replaceAll("!1", "▂");
              txt = txt.replaceAll("!2", "▃");
              txt = txt.replaceAll("!3", "▅");
              txt = txt.replaceAll("!4", "▆");
              txt = txt.replaceAll("!5", "▇");

              d.name = replaceSomeText(txt, true);
              graph.initState.nodes[d.id].name = d.name;
              // restartN(3);
              // graph.isZoom = true;
              // d3.select("#node__" + d.id).select("text").text(txt);
            }
          }
        },
        iconsGroup: {
          className: 'context-menu-input',
          type: "iconsGroup"
        },
        fontSize: {
          name: "Text size",
          className: 'context-menu-my-input context-left',
          type: 'text',
          value: 14,
          events: {
            keyup: function (e, opt) {
              if (e.keyCode === 13 && graph.keyPress) {
                $(".context-menu-list").hide();
                graph.selectedGroups = [];
              }
              graph.keyPress = true;
              if ((e.keyCode >= 37 && e.keyCode <= 40) || (e.keyCode === 8)) return;
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var fontSize = +e.target.value || 20;
              fontSize = fontSize < 10 ? 10 : fontSize;
              fontSize = fontSize > 30 ? 30 : fontSize;
              graph.initState.nodes[d.id].fontSize = fontSize;
              if (graph.selectedGroups.length > 0) {
                graph.selectedGroups.map(function (d) {
                  graph.initState.nodes[d].fontSize = fontSize;
                });
              }
              restartN(3);
            }
          }
        },
        textAnchorGroup: {
          className: 'context-menu-item context-menu-my-input context-right',
          type: "textAnchorGroup",
        },
        delete: {
          name: "Delete group",
          className: 'context-left margin-for-span margin-for-icon-add',
          icon: "delete",
          disabled: function (key, opt) {
            var d = d3.select(opt.$trigger[0]).data()[0];
            var disabled = false;
            var keys = d3.keys(graph.initState.nodes);
            keys.map(function (key) {
              if (graph.initState.nodes[key].selectedNodes !== undefined) {
                graph.initState.nodes[key].selectedNodes.map(function (c) {
                  if (c === d.id) {
                    disabled = true;
                  }
                });
              }
            });
            return disabled;
          },
          callback: function (key, opt) {
            if (graph.selectedGroups.length > 0) {
              graph.selectedGroups.map(function (d) {
                var disabled = false;
                var keys = d3.keys(graph.initState.nodes);
                keys.map(function (key) {
                  if (graph.initState.nodes[key].selectedNodes !== undefined) {
                    graph.initState.nodes[key].selectedNodes.map(function (c) {
                      if (c === d) {
                        disabled = true;
                      }
                    });
                  }
                });
                if (disabled) {
                  graph.initState.nodes[d]._selected = false;
                } else {
                  graph.initState.links = graph.initState.links.filter(function (c) {
                    var flag = ((c.source === d && c.target !== d) || (c.source !== d && c.target === d));
                    if (flag) {
                      d3.select("#link-label__" + c.id).remove();
                    }
                    return !flag;
                  });
                  d3.select("#group__" + d).remove();
                  graph.initState.nodes[d] = undefined;
                  delete graph.initState.nodes[d];
                }
              });
            } else {
              var d = d3.select(opt.$trigger[0]).data()[0].id;
              var disabled = false;
              var keys = d3.keys(graph.initState.nodes);
              keys.map(function (key) {
                if (graph.initState.nodes[key].selectedNodes !== undefined) {
                  graph.initState.nodes[key].selectedNodes.map(function (c) {
                    if (c === d) {
                      disabled = true;
                    }
                  });
                }
              });
              if (disabled) {
                graph.initState.nodes[d]._selected = false;
              } else {
                graph.initState.links = graph.initState.links.filter(function (c) {
                  var flag = ((c.source === d && c.target !== d) || (c.source !== d && c.target === d));
                  if (flag) {
                    d3.select("#link-label__" + c.id).remove();
                  }
                  return !flag;
                });
                d3.select("#group__" + d).remove();
                graph.initState.nodes[d] = undefined;
                delete graph.initState.nodes[d];
              }
            }
            restartN(2);
          },
        },
        addNode: {
          name: "Add node",
          className: "float-right context-right margin-for-span margin-for-icon-minus",
          icon: "edit",
          callback: function (key, opt) {
            var d = d3.select(opt.$trigger[0]).data()[0];
            var id = Date.now();
            graph.initState.nodes[id] = {
              "id": id,
              "name": "Label",
              "textAnchor": "start",
              "fill": graph.parameters.nodeColour,
              "stroke": graph.parameters.nodeBorderColour,
              "strokeWidth": graph.parameters.nodeBorderWidth,
              "level": 0,
              "fixed": 1,
              "x": graph.initState.nodes[d.selectedNodes[0]].x,
              "y": graph.initState.nodes[d.selectedNodes[0]].y + 70,
              "width": graph.parameters.nodeWidth,
              "height": 20,
              "strokeDasharray": "solid",
              "textFill": graph.parameters.nodeTextColour
            };
            graph.initState.nodes[d.id].selectedNodes.push(id);
            graph.selectedNodes = [];
            restartN(2);
          }
        },
        invisible: {
          name: "Invisible",
          type: 'checkbox',
          className: 'margin-top-1 context-left',
          selected: false,
          events: {
            click: function (e, opt) {
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var invisible = e.target.checked;
              if (invisible) {
                graph.initState.nodes[d.id].stroke = "transparent";
                graph.initState.nodes[d.id].fill = "transparent";
                graph.initState.nodes[d.id].textFill = "transparent";
              } else {
                graph.initState.nodes[d.id].stroke = graph.parameters.nodeBorderColour;
                graph.initState.nodes[d.id].fill = graph.parameters.nodeColour;
                graph.initState.nodes[d.id].textFill = graph.parameters.nodeTextColour;
              }
              if (graph.selectedGroups.length > 0) {
                graph.selectedGroups.map(function (d) {
                  if (invisible) {
                    graph.initState.nodes[d].stroke = "transparent";
                    graph.initState.nodes[d].fill = "transparent";
                    graph.initState.nodes[d].textFill = "transparent";
                  } else {
                    graph.initState.nodes[d].stroke = graph.parameters.nodeBorderColour;
                    graph.initState.nodes[d].fill = graph.parameters.nodeColour;
                    graph.initState.nodes[d].textFill = graph.parameters.nodeTextColour;
                  }
                });
              }
              restartN(2);
            }
          }
        },
        edit: {
          name: "Add group",
          className: "context-right margin-for-span margin-for-icon-minus",
          icon: "edit",
          callback: function (key, opt) {
            var d = d3.select(opt.$trigger[0]).data()[0];
            var id = Date.now();
            graph.selectedGroups.push(d.id);
            graph.selectedGroups = graph.selectedGroups.filter(onlyUnique);
            if (graph.selectedNodes.length > 0 || graph.selectedGroups.length > 0) {
              var max = d3.max(graph.selectedGroups, function (id) {
                graph.initState.nodes[id]._selected = false;
                return graph.initState.nodes[id].level;
              });
              graph.selectedNodes.map(function (id) {
                graph.initState.nodes[id]._selected = false;
              });

              graph.initState.nodes[id] = {
                "id": id,
                "name": "Label",
                "textAnchor": "start",
                "fill": graph.parameters.groupColour,
                "stroke": graph.parameters.groupBorderColour,
                "strokeWidth": graph.parameters.groupBorderWidth,
                "level": (max + 1),
                "fixed": 1,
                "selectedNodes": graph.selectedNodes.concat(graph.selectedGroups),
                "strokeDasharray": "solid",
                "fontSize": graph.parameters.groupTextSize,
                "textFill": graph.parameters.groupTextColour
              };
              d3.select(".group-group").selectAll("*").remove();
            } else {
              graph.initState.nodes[id] = {
                "id": id,
                "name": "Label",
                "textAnchor": "start",
                "fill": graph.parameters.groupColour,
                "stroke": graph.parameters.groupBorderColour,
                "strokeWidth": graph.parameters.groupBorderWidth,
                "level": (d.level + 1),
                "fixed": 1,
                "selectedNodes": [d.id],
                "strokeDasharray": "solid",
                "fontSize": graph.parameters.groupTextSize,
                "textFill": graph.parameters.groupTextColour
              };
            }
            graph.selectedNodes = [];
            graph.selectedGroups = [];
            d3.selectAll(".g-group").remove();
            restartN(2);
          }
        },
        strokeWidth: {
          name: "Border width",
          className: 'context-menu-my-input clear-both context-left',
          type: 'text',
          value: "1",
          events: {
            keyup: function (e, opt) {
              if (e.keyCode === 13 && graph.keyPress) {
                $(".context-menu-list").hide();
                graph.selectedGroups = [];
              }
              graph.keyPress = true;
              if ((e.keyCode >= 37 && e.keyCode <= 40) || (e.keyCode === 8)) return;
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var strokeWidth = +e.target.value || 100;
              strokeWidth = strokeWidth < 0.1 ? 0.1 : strokeWidth;
              strokeWidth = strokeWidth > 5 ? 5 : strokeWidth;
              e.target.value = strokeWidth;
              d3.select("#group__" + d.id).select(".group").attr("stroke-width", strokeWidth);
              graph.initState.nodes[d.id].strokeWidth = strokeWidth;
              if (graph.selectedGroups.length > 0) {
                graph.selectedGroups.map(function (d) {
                  graph.initState.nodes[d].strokeWidth = strokeWidth;
                });
              }
              restartN(1);
            }
          }
        },
        strokeDasharray: {
          name: "Style",
          className: 'context-menu-my-select-big context-right',
          type: 'select',
          options: {
            1: 'solid',
            2: 'dotted',
            3: 'dashed'
          },
          selected: 1,
          events: {
            click: function (e, opt) {
              var options = {
                1: 'solid',
                2: 'dotted',
                3: 'dashed'
              };
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var number = +e.target.value;
              graph.initState.nodes[d.id].strokeDasharray = options[number];
              if (graph.selectedGroups.length > 0) {
                graph.selectedGroups.map(function (d) {
                  graph.initState.nodes[d].strokeDasharray = options[number];
                });
              }
              restartN(1);
            }
          }
        },
        groupColorPicker: {
          className: 'context-menu-colorpicker context-left',
          type: "groupColorPicker",
        },
        groupBorderColorPicker: {
          className: 'context-menu-colorpicker context-right',
          type: "groupBorderColorPicker",
        },
        groupTextColorPicker: {
          className: 'context-menu-colorpicker context-left',
          type: "groupTextColorPicker",
        },
        tooltip: {
          name: "Notes (tooltip)",
          type: 'textarea',
          className: 'link-textarea-tooltip',
          events: {
            keyup: function (e, opt) {
              if ((e.keyCode === 17 && lastLInkKey === 13) || (e.keyCode === 13 && lastLInkKey === 17)) {
                $(".context-menu-list").hide();
                lastLInkKey = e.keyCode;
                return;
              }
              if (e.keyCode === 13 && graph.keyPress) {
                $(".context-menu-list").hide();
                graph.selectedLinks = [];
              }
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var tooltip = e.target.value.trim();
              d.tooltip = replaceSomeText(tooltip, true);
              graph.initState.nodes[d.id].tooltip = d.tooltip;
            }
          }
        }
      },
      events: {
        show: function (opt) {
          var d = d3.select(opt.$trigger[0]).data()[0];
          opt.items.edittext.value = d.name.replaceAll(' /// ', '\n');
          setTimeout(function () {
            $(".group-textarea-focus").find("textarea").focus();
            if (d.name.replaceAll(' /// ', '\n')==="Label"){
              selectTextareaLine($(".group-textarea-focus").find("textarea")[0]);
            }
          }, 200);
          $('#groupColorPicker').css("background", d.fill);
          $('#groupBorderColorPicker').css("background", d.stroke);
          $('#groupTextColorPicker').css("background", d.textFill || graph.parameters.groupTextColour);
          opt.items.strokeWidth.value = d.strokeWidth;
          opt.items.tooltip.value = d.tooltip;
          opt.items.fontSize.value = d.fontSize || graph.parameters.groupTextSize || 20;
          var options = {
            solid: 1,
            dotted: 2,
            dashed: 3
          };
          opt.items.strokeDasharray.selected = options[d.strokeDasharray];
          opt.items.invisible.selected = (d.stroke === "transparent" && d.fill === "transparent" && d.textFill === "transparent") ? true : false;
          $(".context-menu-title-wrapper")
            .removeClass("d3-hide").addClass(graph.selectedGroups.length === 1 ? "d3-hide" : "")
            .find(".context-menu-title").text("Selected " + (graph.selectedGroups.length || 1) + " Group" + ((graph.selectedGroups.length || 1) > 1 ? "s" : ""));
        },
        hide: function (opt) {
          $('.icolor').hide();
          graph.selectedNodes = [];
          graph.selectedGroups = [];
          restartN(3);
        }
      }
    });

    var lastLInkKey = 13;
    $.contextMenu({
      selector: '.link',
      position: function (opt, x, y) {
        opt.$menu.css({
          top: graph.contextMenuPosition.y + 50,
          left: graph.contextMenuPosition.x + 15
        });
      },
      items: {
        contextMenuTitle: {
          className: 'context-menu-title-wrapper',
          type: "contextMenuTitle",
        },
        edittext: {
          name: "Edit text",
          type: 'textarea',
          className: 'link-textarea-focus',
          events: {
            keyup: function (e, opt) {
              if ((e.keyCode === 17 && lastLInkKey === 13) || (e.keyCode === 13 && lastLInkKey === 17)) {
                $(".context-menu-list").hide();
                restartN(3);
                lastLInkKey = e.keyCode;
                return;
              }
              if (e.keyCode === 13 && graph.keyPress) {
                $(".context-menu-list").hide();
                graph.selectedLinks = [];
              }
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var name = e.target.value;
              var txt = name.replaceAll('\n', ' /// ');
              txt = txt.trim();
              d.name = replaceSomeText(txt, true);
              graph.initState.links.map(function (c) {
                if (c.id == d.id) {
                  c.name = d.name;
                }
              });
              d3.select("#link-label__" + d.id).text(txt);
            }
          }
        },
        iconsLink: {
          className: 'context-menu-input',
          type: "iconsLink",
        },
        delete: {
          name: "Delete arrow",
          icon: "delete",
          className: " context-left",
          callback: function (key, opt) {
            var d = d3.select(opt.$trigger[0]).data()[0];
            graph.initState.links = graph.initState.links.filter(function (c) {
              var flag = c.id === d.id;
              if (flag) {
                d3.select("#link-label__" + c.id).remove();
              }
              return !flag;
            });
            if (graph.selectedLinks.length > 0) {
              graph.selectedLinks.map(function (d) {
                graph.initState.links = graph.initState.links.filter(function (c) {
                  var flag = c.id === d;
                  if (flag) {
                    d3.select("#link-label__" + c.id).remove();
                  }
                  return !flag;
                });
              });
            }
            restartN(1);
          },
        },
        isArrowName: {
          name: "Text at arrowhead",
          type: 'checkbox',
          className: 'margin-top-1 context-left',
          selected: false,
          events: {
            click: function (e, opt) {
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var isArrowName = e.target.checked;
              if (graph.selectedLinks.length > 0) {
                graph.selectedLinks.map(function (d) {
                  graph.initState.links.map(function (c) {
                    if (c.id == d) {
                      c.isArrowName = isArrowName;
                    }
                  });
                });
              }
              restartN(1);
            }
          }
        },
        negative: {
          name: "Negative arrow",
          type: 'checkbox',
          className: 'margin-top-1 context-right',
          selected: false,
          events: {
            click: function (e, opt) {
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var negative = e.target.checked;
              if (graph.selectedLinks.length > 0) {
                graph.selectedLinks.map(function (d) {
                  graph.initState.links.map(function (c) {
                    if (c.id == d) {
                      if (negative) {
                        c.stroke = 'blue';
                      } else {
                        c.stroke = graph.parameters.linkBorderColour;
                      }
                    }
                  });
                });
              }
              restartN(1);
            }
          }
        },
        marker: {
          name: "No head",
          type: 'checkbox',
          className: 'margin-top-1 context-left',
          selected: false,
          events: {
            click: function (e, opt) {
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var marker = !e.target.checked;
              if (graph.selectedLinks.length > 0) {
                graph.selectedLinks.map(function (d) {
                  graph.initState.links.map(function (c) {
                    if (c.id == d) {
                      c.marker = marker;
                    }
                  });
                });
              }
              restartN(1);
            }
          }
        },
        key: {
          name: "Reverse direction",
          className: 'padding-left-8 context-menu-my-input context-right context-like-button',
          callback: function (key, opt) {
            var d = d3.select(opt.$trigger[0]).data()[0];
            graph.initState.links.map(function (c) {
              if (c.id == d.id) {
                c.marker = true;
                if (c.drAdditional < 0) {
                  c.drAdditional = Math.abs(c.drAdditional);
                } else if (c.drAdditional > 0) {
                  c.drAdditional = -c.drAdditional;
                }
                c.source = d.linkTarget;
                c.target = d.linkSource;
              }
            });
            restartN(1);
          }
        },
        strokeDasharray: {
          name: "Style",
          className: 'context-menu-my-select-big context-left',
          type: 'select',
          options: {
            1: 'solid',
            2: 'dotted',
            3: 'dashed'
          },
          selected: 1,
          events: {
            click: function (e, opt) {
              var options = {
                1: 'solid',
                2: 'dotted',
                3: 'dashed'
              };
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var number = +e.target.value;
              if (graph.selectedLinks.length > 0) {
                graph.selectedLinks.map(function (d) {
                  graph.initState.links.map(function (c) {
                    if (c.id == d) {
                      c.strokeDasharray = options[number];
                    }
                  });
                });
              }
              restartN(1);
            }
          }
        },
        textAnchorLink: {
          className: 'context-menu-item context-menu-my-input context-right',
          type: "textAnchorLink"
        },
        sourcePosition: {
          name: "Source",
          className: 'context-menu-my-select-big context-left',
          type: 'select',
          options: {
            1: 'auto',
            2: 'top-left',
            3: 'top-right',
            4: 'bottom-left',
            5: 'bottom-right'
          },
          selected: 1,
          events: {
            click: function (e, opt) {
              var options = {
                1: 'auto',
                2: 'top-left',
                3: 'top-right',
                4: 'bottom-left',
                5: 'bottom-right'
              };
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var number = +e.target.value;
              if (graph.selectedLinks.length > 0) {
                graph.selectedLinks.map(function (d) {
                  graph.initState.links.map(function (c) {
                    if (c.id == d) {
                      c.sourcePosition = options[number];
                    }
                  });
                });
              }
              restartN(1);
            }
          }
        },
        targerPosition: {
          name: "Target",
          className: 'context-menu-my-select-big context-right',
          type: 'select',
          options: {
            1: 'auto',
            2: 'top-left',
            3: 'top-right',
            4: 'bottom-left',
            5: 'bottom-right'
          },
          selected: 1,
          events: {
            click: function (e, opt) {
              var options = {
                1: 'auto',
                2: 'top-left',
                3: 'top-right',
                4: 'bottom-left',
                5: 'bottom-right'
              };
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var number = +e.target.value;
              if (graph.selectedLinks.length > 0) {
                graph.selectedLinks.map(function (d) {
                  graph.initState.links.map(function (c) {
                    if (c.id == d) {
                      c.targerPosition = options[number];
                    }
                  });
                });
              }
              restartN(1);
            }
          }
        },
        strokeWidth: {
          name: "Width",
          className: 'context-menu-my-input context-left',
          type: 'text',
          value: "1",
          events: {
            keyup: function (e, opt) {
              if (e.keyCode === 13 && graph.keyPress) {
                $(".context-menu-list").hide();
                graph.selectedLinks = [];
              }
              graph.keyPress = true;
              if ((e.keyCode >= 37 && e.keyCode <= 40) || (e.keyCode === 8)) return;
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var strokeWidth = +e.target.value || 1;
              strokeWidth = strokeWidth > 5 ? 5 : strokeWidth;
              d3.select("#link__" + d.id).style("stroke-width", strokeWidth);
              if (graph.selectedLinks.length > 0) {
                graph.selectedLinks.map(function (d) {
                  graph.initState.links.map(function (c) {
                    if (c.id == d) {
                      c.strokeWidth = strokeWidth;
                    }
                  });
                });
              }
              restartN(1);
            }
          }
        },
        drAdditional: {
          name: "Curved (%)",
          className: 'context-menu-my-input context-right',
          type: 'text',
          value: "0",
          events: {
            keyup: function (e, opt) {
              if (e.keyCode === 13 && graph.keyPress) {
                $(".context-menu-list").hide();
                graph.selectedLinks = [];
              }
              graph.keyPress = true;
              if ((e.keyCode >= 37 && e.keyCode <= 40)) return;
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var drAdditional = Math.round(+e.target.value) || 0;
              if (graph.selectedLinks.length > 0) {
                graph.selectedLinks.map(function (d) {
                  graph.initState.links.map(function (c) {
                    if (c.id == d) {
                      c.drAdditional = drAdditional;
                    }
                  });
                });
              }
              restartN(1);
            }
          }
        },
        linkStrokePicker: {
          className: 'context-menu-colorpicker context-left',
          type: "linkStrokePicker"
        },
        linkFillPicker: {
          className: 'context-menu-colorpicker margin-left-16 context-right',
          type: "linkFillPicker"
        },
        tooltip: {
          name: "Notes (tooltip)",
          type: 'textarea',
          className: 'link-textarea-tooltip',
          events: {
            keyup: function (e, opt) {
              if ((e.keyCode === 17 && lastLInkKey === 13) || (e.keyCode === 13 && lastLInkKey === 17)) {
                $(".context-menu-list").hide();
                lastLInkKey = e.keyCode;
                return;
              }
              if (e.keyCode === 13 && graph.keyPress) {
                $(".context-menu-list").hide();
                graph.selectedLinks = [];
              }
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var tooltip = e.target.value.trim();
              d.tooltip = replaceSomeText(tooltip, true);
              graph.initState.links.map(function (c) {
                if (c.id == d.id) {
                  c.tooltip = d.tooltip;
                }
              });
            }
          }
        }
      },
      events: {
        show: function (opt) {
          var d = d3.select(opt.$trigger[0]).data()[0];
          opt.items.edittext.value = d.name;
          opt.items.tooltip.value = d.tooltip;
          setTimeout(function () {
            $(".link-textarea-focus").find("textarea").focus();
          }, 200);
          opt.items.drAdditional.value = d.drAdditional || 0;
          opt.items.isArrowName.selected = d.isArrowName;
          opt.items.marker.selected = !d.marker;
          opt.items.strokeWidth.value = d.strokeWidth;
          $('#linkFillPicker').css("background", d.fill);
          $('#linkStrokePicker').css("background", d.stroke);
          var options = {
            solid: 1,
            dotted: 2,
            dashed: 3
          };
          opt.items.strokeDasharray.selected = options[d.strokeDasharray];
          options = {
            'auto': 1,
            'top-left': 2,
            'top-right': 3,
            'bottom-left': 4,
            'bottom-right': 5
          };
          opt.items.targerPosition.selected = options[d.targerPosition];
          opt.items.sourcePosition.selected = options[d.sourcePosition];
          opt.items.negative.selected = d.stroke === 'blue' ? true : false;
          graph.selectedLinks = graph.selectedLinks.filter(onlyUnique);
          $(".context-menu-title-wrapper")
            .removeClass("d3-hide").addClass(graph.selectedLinks.length === 1 ? "d3-hide" : "")
            .find(".context-menu-title").text("Selected " + (graph.selectedLinks.length || 1) + " Arrow" + ((graph.selectedLinks.length || 1) > 1 ? "s" : ""));
        },
        hide: function (opt) {
          $('.icolor').hide();
          graph.selectedLinks = [];
          restartN(1);
        }
      }
    });

    $.contextMenu({
      selector: '.node',
      position: function (opt, x, y) {
        opt.$menu.css({
          top: graph.contextMenuPosition.y + 50,
          left: graph.contextMenuPosition.x + 15
        });
      },
      items: {
        contextMenuTitle: {
          className: 'context-menu-title-wrapper',
          type: "contextMenuTitle",
        },
        edittext: {
          name: "Edit text",
          type: 'textarea',
          className: 'node-textarea-focus',
          height: 80,
          events: {
            keyup: function (e, opt) {
              // console.log(e.keyCode, lastLInkKey);
              if ((e.keyCode === 17 && lastLInkKey === 13) || (e.keyCode === 13 && lastLInkKey === 17)) {
                $(".context-menu-list").hide();
                restartN(3);
                lastLInkKey = e.keyCode;
                return;
              }
              // if (e.keyCode === 13 && graph.keyPress) {
              //   $(".context-menu-list").hide();
              //   graph.selectedNodes = [];
              // }
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var name = e.target.value;
              if (e.keyCode === 13) {
                e.target.value = e.target.value + '\n';
                name = name + '\n';
              }
              // console.log(name);
              var txt = name.replaceAll('\n', ' /// ');
              // var txt = (frm.select(".makeEditable").node().value).replaceAll('\n', ' /// ');
              // if (e.keyCode !== 13){
              //   var paragraphs = txt.split("///  ///");
              //   if (paragraphs.length === 1) {
              //     paragraphs = txt.split("///   ///");
              //   }
              //   if (paragraphs.length > 1) {
              //     $(document).off("click");
              //     var isLastEnter = paragraphs[paragraphs.length - 1].lastIndexOf(" /// ");
              //     if (isLastEnter > 0) {
              //       paragraphs[paragraphs.length - 1] = paragraphs[paragraphs.length - 1].substring(0, isLastEnter);
              //     }
              //     paragraphs.map(function (c, i) {
              //       c = c.trim();
              //       if (i === 0) {
              //         d.name = c;
              //       } else {
              //         if (!c || c === " ") {
              //           return;
              //         }
              //         var id = (+d.id) + i + getRandomArbitrary(100, 1000);
              //         dblclickAddNode(this, [d.x, d.y + i * graph.parameters.horizontalGap], id);
              //         graph.initState.nodes[id].name = c;
              //         graph.initState.nodes[id].fontSize = d.fontSize; // the same as in editted node
              //         Object.keys(graph.initState.nodes).map(function (objectKey) { // add new node for parrent/group of editted node
              //           var node = graph.initState.nodes[objectKey];
              //           if (node.level > 0 && node.selectedNodes.length > 0) {
              //             node.selectedNodes.map(function (c) {
              //               if (c === d.id) {
              //                 graph.initState.nodes[node.id].selectedNodes.push(id);
              //               }
              //             })
              //           }
              //         });
              //       }
              //     });
              //     // d3.selectAll(".foreign-object").remove();
              //     $(".context-menu-list").hide();
              //     restartN(2);
              //     return;
              //   }
              // }
              
              txt = txt.trim();

              var bars = {
                "!1": "▂",
                "!2": "▃",
                "!3": "▅",
                "!4": "▆",
                "!5": "▇"
              };
              // also when concatenated only need one “!", e.g. !531 is the same as !5!3!1 
              var words = txt.replaceAll("[A-Za-z]", "").split(" ")
                .filter(function (d) {
                  return (d.indexOf("!") === 0 && (+d.substring(1, d.length)) > 0) && (/^[1-5]+$/.test(d.replaceAll("!", "")));
                })
                .map(function (d) {
                  var numberAsString = d.replaceAll("!", "") + "";
                  var stringArray = numberAsString.split("");
                  var unicodes = "";
                  stringArray.map(function (d) {
                    unicodes = unicodes + bars["!" + d];
                  });
                  txt = txt.replaceAll(d, unicodes);
                });
              txt = txt.replaceAll("!1", "▂");
              txt = txt.replaceAll("!2", "▃");
              txt = txt.replaceAll("!3", "▅");
              txt = txt.replaceAll("!4", "▆");
              txt = txt.replaceAll("!5", "▇");

              d.name = replaceSomeText(txt, true);
              // console.log(d.name);
              graph.initState.nodes[d.id].name = d.name;
              // restartN(3);
              // graph.isZoom = true;
              // d3.select("#node__" + d.id).select("text").text(txt);
            }
          }
        },
        iconsNode: {
          className: 'context-menu-input',
          type: "iconsNode"
        },
        fontSize: {
          name: "Text size",
          className: 'context-menu-my-input clear-both context-left',
          type: 'text',
          value: 14,
          events: {
            keyup: function (e, opt) {
              // console.log('key: ' + e.keyCode, +e.target.value, opt);
              if (e.keyCode === 13 && graph.keyPress) { //Enter
                $(".context-menu-list").hide();
                graph.selectedNodes = [];
              }
              graph.keyPress = true;
              if ((e.keyCode >= 37 && e.keyCode <= 40) || (e.keyCode === 8)) return;
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var fontSize = +e.target.value || 14;
              fontSize = fontSize < 10 ? 10 : fontSize;
              fontSize = fontSize > 30 ? 30 : fontSize;
              // e.target.value = fontSize;
              graph.initState.nodes[d.id].fontSize = fontSize;
              if (graph.selectedNodes.length === 0) {
                graph.selectedNodes.map(function (d) {
                  graph.initState.nodes[d].fontSize = fontSize;
                });
              }
              restartN(3);
            }
          }
        },
        textAnchorNode: {
          className: 'context-menu-item context-menu-my-input context-right',
          type: "textAnchorNode",
        },
        delete: {
          name: "Delete node",
          className: 'clear-both context-left margin-for-icon-add',
          icon: "delete",
          callback: function (key, opt) {
            var d = d3.select(opt.$trigger[0]).data()[0];
            // var hasGroup = false;
            recursiveDelete(d.id);
            if (graph.selectedNodes.length > 0) {
              graph.selectedNodes.map(function (d) {
                recursiveDelete(d);
              });
            }
            d3.select(".group-group").selectAll("*").remove();
            restartN(2);
          },
        },
        edit: {
          name: "Create group",
          icon: "edit",
          className: "context-right margin-for-icon-minus",
          callback: function (key, opt) {
            var d = d3.select(opt.$trigger[0]).data()[0];
            var id = Date.now();
            graph.selectedNodes.push(d.id);
            graph.selectedNodes = graph.selectedNodes.filter(onlyUnique);
            var max;
            if (graph.selectedNodes.length > 0 && graph.selectedGroups.length > 0) {
              if (graph.selectedGroups.length) {
                max = d3.max(graph.selectedGroups, function (id) {
                  graph.initState.nodes[id]._selected = false;
                  return graph.initState.nodes[id].level;
                });
                graph.selectedNodes.map(function (id) {
                  graph.initState.nodes[id]._selected = false;
                });
              } else {
                max = d3.max(graph.selectedNodes, function (id) {
                  graph.initState.nodes[id]._selected = false;
                  return graph.initState.nodes[id].level;
                });
              }
              graph.initState.nodes[id] = {
                "id": id,
                "name": "Label", // + (max + 1), //[""],
                "textAnchor": "start",
                "fill": graph.parameters.groupColour, //"#ffffff",
                "stroke": graph.parameters.groupBorderColour,
                "strokeWidth": graph.parameters.groupBorderWidth,
                "level": (max + 1), //1
                "fixed": 1,
                "selectedNodes": graph.selectedNodes.concat(graph.selectedGroups),
                "strokeDasharray": "solid",
                "fontSize": graph.parameters.groupTextSize
              };
              d3.select(".group-group").selectAll("*").remove();
              // graph.selectedNodes = [];
              // graph.selectedGroups = [];
            } else if (graph.selectedNodes.length === 0) {
              graph.initState.nodes[id] = {
                "id": id,
                "name": "Label", // + (d.level + 1), //[""],
                "textAnchor": "start",
                "fill": graph.parameters.groupColour, //"#ffffff",
                "stroke": graph.parameters.groupBorderColour,
                "strokeWidth": graph.parameters.groupBorderWidth,
                "level": (d.level + 1), //1
                "fixed": 1,
                "selectedNodes": [d.id],
                "strokeDasharray": "solid",
                "fontSize": graph.parameters.groupTextSize
              };
              // graph.selectedGroups = [];
              // graph.selectedNodes = [];
            } else if (graph.selectedNodes.length > 0) {
              graph.initState.nodes[id] = {
                "id": id,
                "name": "Label", // + (d.level + 1), //[""],
                "textAnchor": "start",
                "fill": graph.parameters.groupColour, //"#ffffff",
                "stroke": graph.parameters.groupBorderColour,
                "strokeWidth": graph.parameters.groupBorderWidth,
                "level": (d.level + 1), //1
                "fixed": 1,
                "selectedNodes": graph.selectedNodes,
                "strokeDasharray": "solid",
                "fontSize": graph.parameters.groupTextSize
              };
              // graph.selectedGroups = [];
              // graph.selectedNodes = [];
              // restartN(1);
            }
            graph.selectedNodes = [];
            graph.selectedGroups = [id];
            restartN(2);
          }
        },
        invisible: {
          name: "Invisible",
          type: 'checkbox',
          className: 'margin-top-1 clear-both context-left',
          selected: false,
          events: {
            click: function (e, opt) {
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var invisible = e.target.checked;
              if (invisible) {
                graph.initState.nodes[d.id].stroke = "transparent";
                graph.initState.nodes[d.id].fill = "transparent";
                graph.initState.nodes[d.id].textFill = "transparent";
              } else {
                graph.initState.nodes[d.id].stroke = graph.parameters.nodeBorderColour;
                graph.initState.nodes[d.id].fill = graph.parameters.nodeColour;
                graph.initState.nodes[d.id].textFill = graph.parameters.nodeTextColour;
              }
              if (graph.selectedNodes.length > 0) {
                graph.selectedNodes.map(function (d) {
                  if (invisible) {
                    graph.initState.nodes[d].stroke = "transparent";
                    graph.initState.nodes[d].fill = "transparent";
                    graph.initState.nodes[d].textFill = "transparent"; //graph.initState.nodes[d].name = "";
                  } else {
                    graph.initState.nodes[d].stroke = graph.parameters.nodeBorderColour;
                    graph.initState.nodes[d].fill = graph.parameters.nodeColour;
                    graph.initState.nodes[d].textFill = graph.parameters.nodeTextColour; //graph.initState.nodes[d].name = "Label";
                  }
                });
              }
              restartN(1);
            }
          }
        },
        fixedVerticalGap: {
          name: "Fixed vertical spacing",
          type: 'checkbox',
          className: 'margin-top-1 context-right',
          selected: false,
          events: {
            click: function (e, opt) {
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var fixedVerticalGap = e.target.checked;
              graph.initState.nodes[d.id].fixedVerticalGap = fixedVerticalGap;
              if (graph.selectedNodes.length > 0) {
                graph.selectedNodes.map(function (d) {
                  graph.initState.nodes[d].fixedVerticalGap = fixedVerticalGap;
                });
              }
              restartN(1);
            }
          }
        },
        width: {
          name: "Width",
          className: 'context-menu-my-input clear-both context-left',
          type: 'text',
          value: "100",
          events: {
            keyup: function (e, opt) {
              if (e.keyCode === 13 && graph.keyPress) {
                $(".context-menu-list").hide();
                graph.selectedNodes = [];
              }
              graph.keyPress = true;
              if ((e.keyCode >= 37 && e.keyCode <= 40) || (e.keyCode === 8)) return;
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var width = +e.target.value || 100;
              width = width < 0.1 ? 0.1 : width;
              width = width > 500 ? 500 : width;
              e.target.value = width;
              d3.select("#node__" + d.id).select(".node").attr("width", width);
              graph.initState.nodes[d.id].width = width;
              if (graph.selectedNodes.length > 0) {
                graph.selectedNodes.map(function (d) {
                  graph.initState.nodes[d].width = width;
                });
              }
              restartN(1);
            }
          }
        },
        strokeWidth: {
          name: "Border width",
          className: 'context-menu-my-input context-right',
          type: 'text',
          value: "1",
          events: {
            keyup: function (e, opt) {
              if (e.keyCode === 13 && graph.keyPress) {
                $(".context-menu-list").hide();
                graph.selectedNodes = [];
              }
              graph.keyPress = true;
              if ((e.keyCode >= 37 && e.keyCode <= 40) || (e.keyCode === 8)) return;
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var strokeWidth = +e.target.value || 100;
              strokeWidth = strokeWidth < 0.1 ? 0.1 : strokeWidth;
              strokeWidth = strokeWidth > 5 ? 5 : strokeWidth;
              e.target.value = strokeWidth;
              d3.select("#node__" + d.id).select(".node").attr("stroke-width", strokeWidth);
              graph.initState.nodes[d.id].strokeWidth = strokeWidth;
              if (graph.selectedNodes.length > 0) {
                graph.selectedNodes.map(function (d) {
                  graph.initState.nodes[d].strokeWidth = strokeWidth;
                });
              }
              restartN(1);
            }
          }
        },
        strokeDasharray: {
          name: "Style",
          className: 'context-menu-my-select-big clear-both context-left',
          type: 'select',
          options: {
            1: 'solid',
            2: 'dotted',
            3: 'dashed'
          },
          selected: 1,
          events: {
            click: function (e, opt) {
              var options = {
                1: 'solid',
                2: 'dotted',
                3: 'dashed'
              };
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var number = +e.target.value;
              graph.initState.nodes[d.id].strokeDasharray = options[number];
              if (graph.selectedNodes.length > 0) {
                graph.selectedNodes.map(function (d) {
                  graph.initState.nodes[d].strokeDasharray = options[number];
                });
              }
              restartN(1);
            }
          }
        },
        "nodeColorPicker": {
          className: 'context-menu-colorpicker context-right',
          type: "nodeColorPicker"
        },
        "nodeBorderColorPicker": {
          className: 'context-menu-colorpicker clear-both context-left',
          type: "nodeBorderColorPicker",
        },
        "nodeTextColorPicker": {
          className: 'context-menu-colorpicker context-right',
          type: "nodeTextColorPicker"
        },
        tooltip: {
          name: "Notes (tooltip)",
          type: 'textarea',
          className: 'link-textarea-tooltip',
          events: {
            keyup: function (e, opt) {
              if ((e.keyCode === 17 && lastLInkKey === 13) || (e.keyCode === 13 && lastLInkKey === 17)) {
                $(".context-menu-list").hide();
                lastLInkKey = e.keyCode;
                return;
              }
              if (e.keyCode === 13 && graph.keyPress) {
                $(".context-menu-list").hide();
                graph.selectedLinks = [];
              }
              var d = d3.select(e.data.$trigger[0]).data()[0];
              var tooltip = e.target.value.trim();
              d.tooltip = replaceSomeText(tooltip, true);
              graph.initState.nodes[d.id].tooltip = d.tooltip;
            }
          }
        }
      },
      events: {
        show: function (opt) {
          var d = d3.select(opt.$trigger[0]).data()[0];
          opt.items.edittext.value = d.name.replaceAll(' /// ', '\n');
          setTimeout(function () {
            $(".node-textarea-focus").find("textarea").focus();
            if (d.name.replaceAll(' /// ', '\n')==="Label"){
              selectTextareaLine($(".node-textarea-focus").find("textarea")[0]);
            }
          }, 200);
          $('#nodeColorPicker').css("background", d.fill);
          $('#nodeBorderColorPicker').css("background", d.stroke);
          $('#nodeTextColorPicker').css("background", d.textFill || graph.parameters.nodeTextColour);
          opt.items.width.value = d.width;
          opt.items.tooltip.value = d.tooltip;
          opt.items.strokeWidth.value = d.strokeWidth;
          opt.items.fontSize.value = d.fontSize || graph.parameters.nodeTextSize || 14;
          var options = {
            solid: 1,
            dotted: 2,
            dashed: 3
          };
          opt.items.strokeDasharray.selected = options[d.strokeDasharray];
          opt.items.invisible.selected = (d.stroke === "transparent" && d.fill === "transparent" && d.textFill === "transparent") ? true : false;
          opt.items.fixedVerticalGap.selected = d.fixedVerticalGap || false;
          $(".context-menu-title-wrapper")
            .removeClass("d3-hide").addClass(graph.selectedNodes.length === 1 ? "d3-hide" : "")
            .find(".context-menu-title").text("Selected " + (graph.selectedNodes.length || 1) + " Variable" + ((graph.selectedNodes.length || 1) > 1 ? "s" : "")).parent().css("display", graph.selectedNodes.length === 1 ? "none" : "block");
        },
        hide: function (opt) {
          $('.icolor').hide();
          graph.selectedNodes = [];
          graph.selectedGroups.map(function (d) {
            if (graph.initState.nodes[d]) {
              graph.initState.nodes[d]._selected = false;
            }
          });
          restartN(3);
        }
      }
    });



    function render(_selection) {
      _selection.each(function (initState) {
        if (!initState) {
          return;
        }
        graph.parameters.verticalGap = 30;
        graph.parameters.horizontalGap = 50;

        if (initState.links.length === 0 && d3.keys(initState.nodes).length === 0) {
          d3.select(".group-group").selectAll("*").remove();
          d3.select(".node-group").selectAll("*").remove();
          d3.select(".link-group").selectAll("*").remove();
          d3.select(".arrow-group").selectAll("*").remove();
        }
        if (!svg) {
          d3.select('body')
            .call(d3.keybinding()
              .on('↑', function () {
                var isSearch = true;
                var current;
                var next;
                var previous;
                if (d3.event.ctrlKey || d3.event.metaKey) {
                  // if the node has a target, deselect the current node, create a new target-sibling, and select it. else do nothing.
                  if (graph.selectedNodes.length > 0) {
                    graph.selectedNodes.map(function (id, i) {
                      if (i < graph.selectedNodes.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedNodes.splice(0, graph.selectedNodes.length - 1); //keep last
                    // graph.selectedNodes.splice(1);//keep first
                    graph.selectedGroups = [];
                    current = graph.initState.nodes[graph.selectedNodes[0]];
                  } else if (graph.selectedGroups.length > 0) {
                    graph.selectedGroups.map(function (id, i) {
                      if (i > 0) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedGroups.splice(0, graph.selectedNodes.length - 1); //keep last
                    graph.selectedNodes = [];
                    current = graph.initState.nodes[graph.selectedGroups[0]];
                  } else {
                    return;
                  }
                  graph.initState.links.map(function (currentlink) {
                    if (isSearch && currentlink.target == current.id) {
                      isSearch = false;
                      // var next = graph.initState.nodes[currentlink.source];
                      graph.mousedownNode = {};
                      graph.mousedownNode.id = currentlink.source;
                      var coords = [current.x, current.y];
                      current._selected = false;
                      var id = dblclickAddNode(false, coords, false);
                      graph.initState.nodes[id]._selected = true;
                      Object.keys(graph.initState.nodes).map(function (key, index) { // if gtoup has current, need add new in group
                        if (graph.initState.nodes[key].level > 0 && graph.initState.nodes[key].selectedNodes) {
                          graph.initState.nodes[key].selectedNodes.map(function (c) {
                            if (current.id == c) {
                              graph.initState.nodes[key].selectedNodes.push(id);
                            }
                          });
                        }
                      });
                      if (graph.selectedNodes.length > 0) {
                        graph.selectedNodes = [];
                        graph.selectedNodes.push(id);
                      } else if (graph.selectedGroups.length > 0) {
                        graph.selectedGroups = [];
                        graph.selectedGroups.push(id);
                      }
                      graph.mouseupNode = {};
                      graph.mouseupNode.id = id;
                      mouseupAddLink(initState, false);
                      restartN(2);
                      resetMouseVars();
                    }
                  });
                  restartN(1);

                } else { // up arrow - previous sibling of this node
                  if (graph.selectedNodes.length > 0) {
                    graph.selectedNodes.map(function (id, i) {
                      if (i < graph.selectedNodes.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedNodes.splice(0, graph.selectedNodes.length - 1); //keep last
                    graph.selectedGroups = [];
                    current = graph.initState.nodes[graph.selectedNodes[0]];
                  } else if (graph.selectedGroups.length > 0) {
                    graph.selectedGroups.map(function (id, i) {
                      if (i < graph.selectedGroups.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedGroups.splice(0, graph.selectedGroups.length - 1); //keep last
                    graph.selectedNodes = [];
                    current = graph.initState.nodes[graph.selectedGroups[0]];
                  } else {
                    return;
                  }
                  // if the node has any target-siblings, deselect the current node and select the next target-sibling. 
                  graph.initState.links.map(function (currentlink) {
                    if (isSearch && currentlink.target == current.id) {
                      graph.initState.links.map(function (nextlink) {
                        if (isSearch && nextlink.source == currentlink.source && +nextlink.target > +current.id) {
                          isSearch = false;
                          next = graph.initState.nodes[nextlink.target];
                          current._selected = false;
                          next._selected = true;
                          if (graph.selectedNodes.length > 0) {
                            graph.selectedNodes = [];
                            graph.selectedNodes.push(next.id);
                          } else if (graph.selectedGroups.length > 0) {
                            graph.selectedGroups = [];
                            graph.selectedGroups.push(next.id);
                          }
                        }
                      });
                    }
                  });
                  // else if the node has any source-siblings, deselect the current node and select the next source-sibling. 
                  if (isSearch) {
                    graph.initState.links.map(function (currentlink) {
                      if (isSearch && currentlink.source == current.id) {
                        graph.initState.links.map(function (nextlink) {
                          if (isSearch && nextlink.target == currentlink.target && +nextlink.source > +current.id) {
                            isSearch = false;
                            next = graph.initState.nodes[nextlink.source];
                            current._selected = false;
                            next._selected = true;
                            if (graph.selectedNodes.length > 0) {
                              graph.selectedNodes = [];
                              graph.selectedNodes.push(next.id);
                            } else if (graph.selectedGroups.length > 0) {
                              graph.selectedGroups = [];
                              graph.selectedGroups.push(next.id);
                            }
                          }
                        });

                      }
                    });
                  }

                  // from '↓'

                  if (isSearch) {
                    graph.initState.links.map(function (currentlink) {
                      if (isSearch && currentlink.target == current.id) {
                        graph.initState.links.map(function (previouslink) {
                          if (isSearch && previouslink.source == currentlink.source && +previouslink.target < +current.id) {
                            isSearch = false;
                            previous = graph.initState.nodes[previouslink.target];
                            current._selected = false;
                            previous._selected = true;
                            if (graph.selectedNodes.length > 0) {
                              graph.selectedNodes = [];
                              graph.selectedNodes.push(previous.id);
                            } else if (graph.selectedGroups.length > 0) {
                              graph.selectedGroups = [];
                              graph.selectedGroups.push(previous.id);
                            }
                          }
                        });

                      }
                    });
                  }
                  // else if the node has any source-siblings, deselect the current node and select the previous source-sibling. 
                  if (isSearch) {
                    graph.initState.links.map(function (currentlink) {
                      if (isSearch && currentlink.source == current.id) {
                        graph.initState.links.map(function (previouslink) {
                          if (isSearch && previouslink.target == currentlink.target && +previouslink.source < +current.id) {
                            isSearch = false;
                            previous = graph.initState.nodes[previouslink.source];
                            current._selected = false;
                            previous._selected = true;
                            if (graph.selectedNodes.length > 0) {
                              graph.selectedNodes = [];
                              graph.selectedNodes.push(previous.id);
                            } else if (graph.selectedGroups.length > 0) {
                              graph.selectedGroups = [];
                              graph.selectedGroups.push(previous.id);
                            }
                          }
                        });

                      }
                    });
                  }
                  restartN(1);
                }
              })
              .on('↓', function () { // down arrow - next sibling of this node
                var isSearch = true;
                var current;
                var previous;
                var next;
                if (d3.event.ctrlKey || d3.event.metaKey) {
                  // if the node has a target, deselect the current node, create a new target-sibling, and select it. else do nothing.
                  if (graph.selectedNodes.length > 0) {
                    graph.selectedNodes.map(function (id, i) {
                      if (i < graph.selectedNodes.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedNodes.splice(0, graph.selectedNodes.length - 1); //keep last
                    graph.selectedGroups = [];
                    current = graph.initState.nodes[graph.selectedNodes[0]];
                  } else if (graph.selectedGroups.length > 0) {
                    graph.selectedGroups.map(function (id, i) {
                      if (i > 0) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedGroups.splice(0, graph.selectedNodes.length - 1); //keep last
                    graph.selectedNodes = [];
                    current = graph.initState.nodes[graph.selectedGroups[0]];
                  } else {
                    return;
                  }
                  graph.initState.links.map(function (currentlink) {
                    if (isSearch && currentlink.source == current.id) {
                      isSearch = false;
                      // var next = graph.initState.nodes[currentlink.source];
                      graph.mouseupNode = {};
                      graph.mouseupNode.id = currentlink.target;
                      var coords = [current.x, current.y];
                      current._selected = false;
                      var id = dblclickAddNode(false, coords, false);
                      graph.initState.nodes[id]._selected = true;
                      Object.keys(graph.initState.nodes).map(function (key, index) { // if gtoup has current, need add new in group
                        if (graph.initState.nodes[key].level > 0 && graph.initState.nodes[key].selectedNodes) {
                          graph.initState.nodes[key].selectedNodes.map(function (c) {
                            if (current.id == c) {
                              graph.initState.nodes[key].selectedNodes.push(id);
                            }
                          });
                        }
                      });
                      if (graph.selectedNodes.length > 0) {
                        graph.selectedNodes = [];
                        graph.selectedNodes.push(id);
                      } else if (graph.selectedGroups.length > 0) {
                        graph.selectedGroups = [];
                        graph.selectedGroups.push(id);
                      }
                      graph.mousedownNode = {};
                      graph.mousedownNode.id = id;
                      mouseupAddLink(initState, false);
                      restartN(2);
                      resetMouseVars();
                    }
                  });
                  restartN(1);

                } else { // up arrow - next sibling of this node
                  if (graph.selectedNodes.length > 0) {
                    graph.selectedNodes.map(function (id, i) {
                      if (i < graph.selectedNodes.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedNodes.splice(0, graph.selectedNodes.length - 1); //keep last
                    graph.selectedGroups = [];
                    current = graph.initState.nodes[graph.selectedNodes[0]];
                  } else if (graph.selectedGroups.length > 0) {
                    graph.selectedGroups.map(function (id, i) {
                      if (i < graph.selectedGroups.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedGroups.splice(0, graph.selectedGroups.length - 1); //keep last
                    graph.selectedNodes = [];
                    current = graph.initState.nodes[graph.selectedGroups[0]];
                  } else {
                    return;
                  }
                  graph.initState.links.reverse();
                  // if the node has any target-siblings, deselect the current node and select the previous target-sibling. 
                  graph.initState.links.map(function (currentlink) {
                    if (isSearch && currentlink.target == current.id) {
                      graph.initState.links.map(function (previouslink) {
                        if (isSearch && previouslink.source == currentlink.source && +previouslink.target < +current.id) {
                          isSearch = false;
                          previous = graph.initState.nodes[previouslink.target];
                          current._selected = false;
                          previous._selected = true;
                          if (graph.selectedNodes.length > 0) {
                            graph.selectedNodes = [];
                            graph.selectedNodes.push(previous.id);
                          } else if (graph.selectedGroups.length > 0) {
                            graph.selectedGroups = [];
                            graph.selectedGroups.push(previous.id);
                          }
                        }
                      });

                    }
                  });

                  graph.initState.links.map(function (currentlink) {
                    if (isSearch && currentlink.target == current.id) {
                      graph.initState.links.map(function (previouslink) {
                        if (isSearch && previouslink.source == currentlink.source && +previouslink.target < +current.id) {
                          isSearch = false;
                          previous = graph.initState.nodes[previouslink.target];
                          current._selected = false;
                          previous._selected = true;
                          if (graph.selectedNodes.length > 0) {
                            graph.selectedNodes = [];
                            graph.selectedNodes.push(previous.id);
                          } else if (graph.selectedGroups.length > 0) {
                            graph.selectedGroups = [];
                            graph.selectedGroups.push(previous.id);
                          }
                        }
                      });

                    }
                  });

                  // else if the node has any source-siblings, deselect the current node and select the previous source-sibling. 
                  if (isSearch) {
                    graph.initState.links.map(function (currentlink) {
                      if (isSearch && currentlink.source == current.id) {
                        graph.initState.links.map(function (previouslink) {
                          if (isSearch && previouslink.target == currentlink.target && +previouslink.source < +current.id) {
                            isSearch = false;
                            previous = graph.initState.nodes[previouslink.source];
                            current._selected = false;
                            previous._selected = true;
                            if (graph.selectedNodes.length > 0) {
                              graph.selectedNodes = [];
                              graph.selectedNodes.push(previous.id);
                            } else if (graph.selectedGroups.length > 0) {
                              graph.selectedGroups = [];
                              graph.selectedGroups.push(previous.id);
                            }
                          }
                        });
                      }
                    });
                  }

                  // from '↑'

                  // if the node has any target-siblings, deselect the current node and select the next target-sibling. 
                  if (isSearch) {
                    // if the node has any target-siblings, deselect the current node and select the next target-sibling. 
                    graph.initState.links.map(function (currentlink) {
                      if (isSearch && currentlink.target == current.id) {
                        graph.initState.links.map(function (nextlink) {
                          if (isSearch && nextlink.source == currentlink.source && +nextlink.target > +current.id) {
                            isSearch = false;
                            next = graph.initState.nodes[nextlink.target];
                            current._selected = false;
                            next._selected = true;
                            if (graph.selectedNodes.length > 0) {
                              graph.selectedNodes = [];
                              graph.selectedNodes.push(next.id);
                            } else if (graph.selectedGroups.length > 0) {
                              graph.selectedGroups = [];
                              graph.selectedGroups.push(next.id);
                            }
                          }
                        });
                      }
                    });
                  }
                  // else if the node has any source-siblings, deselect the current node and select the next source-sibling. 
                  if (isSearch) {
                    graph.initState.links.map(function (currentlink) {
                      if (isSearch && currentlink.source == current.id) {
                        graph.initState.links.map(function (nextlink) {
                          if (isSearch && nextlink.target == currentlink.target && +nextlink.source > +current.id) {
                            isSearch = false;
                            next = graph.initState.nodes[nextlink.source];
                            current._selected = false;
                            next._selected = true;
                            if (graph.selectedNodes.length > 0) {
                              graph.selectedNodes = [];
                              graph.selectedNodes.push(next.id);
                            } else if (graph.selectedGroups.length > 0) {
                              graph.selectedGroups = [];
                              graph.selectedGroups.push(next.id);
                            }
                          }
                        });
                      }
                    });
                  }
                  graph.initState.links.reverse();
                  restartN(1);
                }
              })
              .on('→', function () {
                // right arrow - navigate to first target node
                var current;
                if (d3.event.ctrlKey || d3.event.metaKey) {
                  if (graph.selectedNodes.length > 0) {
                    graph.selectedNodes.map(function (id, i) {
                      if (i < graph.selectedNodes.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedNodes.splice(0, graph.selectedNodes.length - 1); //keep last
                    current = graph.initState.nodes[graph.selectedNodes[0]];
                  } else {
                    return;
                  }
                  graph.mousedownNode = current;
                  var coords = [current.x + current.width + graph.parameters.verticalGap, current.y];
                  current._selected = false;
                  var id = dblclickAddNode(false, coords, false);
                  Object.keys(graph.initState.nodes).map(function (key, index) { // if gtoup has current, need add new in group
                    if (graph.initState.nodes[key].level > 0 && graph.initState.nodes[key].selectedNodes) {
                      graph.initState.nodes[key].selectedNodes.map(function (c) {
                        if (current.id == c) {
                          graph.initState.nodes[key].selectedNodes.push(id);
                        }
                      });
                    }
                  });
                  graph.selectedNodes = [];
                  graph.selectedNodes.push(id);
                  graph.mouseupNode = {};
                  graph.mouseupNode.id = id;
                  mouseupAddLink(initState, false);
                  restartN(2);
                  resetMouseVars();
                } else {
                  var isSearch = true;
                  if (graph.selectedNodes.length > 0) {
                    graph.selectedNodes.map(function (id, i) {
                      if (i < graph.selectedNodes.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedNodes.splice(0, graph.selectedNodes.length - 1); //keep last
                    graph.selectedGroups = [];
                    current = graph.initState.nodes[graph.selectedNodes[0]];
                  } else if (graph.selectedGroups.length > 0) {
                    graph.selectedGroups.map(function (id, i) {
                      if (i < graph.selectedGroups.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedGroups.splice(0, graph.selectedGroups.length - 1); //keep last
                    graph.selectedNodes = [];
                    current = graph.initState.nodes[graph.selectedGroups[0]];
                  } else {
                    return;
                  }
                  graph.initState.links.map(function (d) {
                    if (current.id == d.source && isSearch) {
                      isSearch = false;
                      graph.initState.nodes[d.target]._selected = true;
                      graph.selectedGroups = [];
                      graph.selectedNodes = [];
                      if (graph.initState.nodes[d.target].level === 0) {
                        graph.selectedNodes.push(graph.initState.nodes[d.target].id);
                      } else {
                        graph.selectedGroups.push(graph.initState.nodes[d.target].id);
                      }
                      current._selected = false;
                    }
                  });
                  // if (!isSearch) {
                  restartN(1);
                  // }
                }

              })
              .on('←', function () {
                var current;
                if (d3.event.ctrlKey || d3.event.metaKey) {
                  if (graph.selectedNodes.length > 0) {
                    graph.selectedNodes.map(function (id, i) {
                      if (i < graph.selectedNodes.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedNodes.splice(0, graph.selectedNodes.length - 1); //keep last
                    current = graph.initState.nodes[graph.selectedNodes[0]];
                  } else {
                    return;
                  }
                  graph.mouseupNode = current;
                  var coords = [current.x - graph.parameters.nodeWidth - graph.parameters.verticalGap, current.y];
                  current._selected = false;
                  var id = dblclickAddNode(false, coords, false);
                  Object.keys(graph.initState.nodes).map(function (key, index) { // if gtoup has current, need add new in group
                    if (graph.initState.nodes[key].level > 0 && graph.initState.nodes[key].selectedNodes) {
                      graph.initState.nodes[key].selectedNodes.map(function (c) {
                        if (current.id == c) {
                          graph.initState.nodes[key].selectedNodes.push(id);
                        }
                      });
                    }
                  });
                  graph.selectedNodes = [];
                  graph.selectedNodes.push(id);
                  graph.mousedownNode = {};
                  graph.mousedownNode.id = id;
                  mouseupAddLink(initState, false);
                  restartN(2);
                  resetMouseVars();
                } else {
                  var isSearch = true;
                  if (graph.selectedNodes.length > 0) {
                    graph.selectedNodes.map(function (id, i) {
                      if (i < graph.selectedNodes.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedNodes.splice(0, graph.selectedNodes.length - 1); //keep last
                    graph.selectedGroups = [];
                    current = graph.initState.nodes[graph.selectedNodes[0]];
                  } else if (graph.selectedGroups.length > 0) {
                    graph.selectedGroups.map(function (id, i) {
                      if (i < graph.selectedGroups.length - 1) {
                        graph.initState.nodes[id]._selected = false;
                      }
                    });
                    graph.selectedGroups.splice(0, graph.selectedGroups.length - 1); //keep last
                    graph.selectedNodes = [];
                    current = graph.initState.nodes[graph.selectedGroups[0]];
                  } else {
                    return;
                  }
                  // left arrow - navigate to first source node
                  graph.initState.links.map(function (d) {
                    if (current.id == d.target && isSearch) {
                      isSearch = false;
                      graph.initState.nodes[d.source]._selected = true;
                      graph.selectedGroups = [];
                      graph.selectedNodes = [];
                      if (graph.initState.nodes[d.source].level === 0) {
                        graph.selectedNodes.push(graph.initState.nodes[d.source].id);
                      } else {
                        graph.selectedGroups.push(graph.initState.nodes[d.target].id);
                      }
                      current._selected = false;
                    }
                  });
                  restartN(1);
                }
              })
              .on('delete', function () {
                var d;
                if (graph.selectedNodes.length > 0) {
                  graph.selectedNodes.map(function (selectedNode) {
                    d = graph.initState.nodes[selectedNode];
                    graph.initState.links = graph.initState.links.filter(function (c) {
                      var flag = ((c.source === d.id && c.target !== d.id) || (c.source !== d.id && c.target === d.id));
                      if (flag) {
                        d3.select("#link-label__" + c.id).remove();
                      }
                      return !flag;
                    });

                    var keys = d3.keys(graph.initState.nodes);
                    keys.map(function (key) {
                      if (graph.initState.nodes[key].selectedNodes !== undefined) {
                        var enable = false;
                        graph.initState.nodes[key].selectedNodes.map(function (c) {
                          if (c === d.id) {
                            enable = true;
                          }
                        });
                        if (enable && graph.initState.nodes[key].selectedNodes.length === 1) {
                          graph.initState.nodes[key] = undefined;
                          delete graph.initState.nodes[key];
                        } else {
                          graph.initState.nodes[key].selectedNodes = graph.initState.nodes[key].selectedNodes.filter(function (c) {
                            return c !== d.id;
                          });
                        }
                      }
                    });
                    if (d.id) {
                      graph.initState.nodes[d.id] = undefined;
                      delete graph.initState.nodes[d.id];
                    }
                  });
                }
                graph.selectedNodes = [];
                if (graph.selectedLinks.length > 0) {
                  graph.selectedLinks.map(function (d) {
                    graph.initState.links = graph.initState.links.filter(function (c) {
                      if (c.id === d) {
                        d3.select("#link-label__" + c.id).remove();
                      }
                      return c.id !== d;
                    });
                  });
                }
                graph.selectedLinks = [];

                if (graph.selectedGroups.length > 0) {
                  graph.selectedGroups.map(function (d) {
                    var disabled = false;
                    var keys = d3.keys(graph.initState.nodes);
                    keys.map(function (key) {
                      if (graph.initState.nodes[key].selectedNodes !== undefined) {
                        graph.initState.nodes[key].selectedNodes.map(function (c) {
                          if (c === d) {
                            disabled = true;
                          }
                        });
                      }
                    });
                    if (disabled) {
                      graph.initState.nodes[d]._selected = false;
                    } else {
                      graph.initState.links = graph.initState.links.filter(function (c) {
                        var flag = ((c.source === d && c.target !== d) || (c.source !== d && c.target === d));
                        if (flag) {
                          d3.select("#link-label__" + c.id).remove();
                        }
                        return !flag;
                      });
                      d3.select("#group__" + d).remove();
                      graph.initState.nodes[d] = undefined;
                      delete graph.initState.nodes[d];
                    }
                  });
                }
                graph.selectedGroups = [];
                // set select first node
                var key = d3.keys(graph.initState.nodes)[0]; //Object.keys(graph.initState.nodes).map(function(key, index) {
                if (graph.initState.nodes[key]) {
                  graph.initState.nodes[key]._selected = true;
                  if (graph.initState.nodes[key].level === 0) {
                    graph.selectedNodes.push(graph.initState.nodes[key].id);
                  } else {
                    graph.selectedGroups.push(graph.initState.nodes[key].id);
                  }
                }
                restartN(2);
              })
              .on('enter', function () {
                if (d3.event.ctrlKey || d3.event.metaKey) {
                  $(".context-menu-list").hide();
                  restartN(3);
                }
                var d;
                // ifContextmenu
                if (graph.selectedNodes.length > 0) {
                  graph.selectedNodes.map(function (id, i) {
                    if (i < graph.selectedNodes.length - 1) {
                      graph.initState.nodes[id]._selected = false;
                    }
                  });
                  graph.selectedNodes.splice(0, graph.selectedNodes.length - 1); //keep last
                  graph.selectedGroups = [];
                  graph.selectedLinks = [];
                  d = initState.nodes[graph.selectedNodes[0]];
                  restartN(1);
                  d._selected = true;
                  d3.select("#node__" + d.id).select(".node-ok").style("opacity", d._selected ? 1 : 0);
                  graph.contextMenuPosition = getCurrentPosition(d, 'node');
                  var el = $('#node__' + d.id + ' .node');
                  if (el.length) {
                    el.contextMenu();
                  }
                  // makeEditable(d3.select("#node__" + d.id).select(".node-edittext").node(), d, 'node');
                  // graph.contextMenuPosition = getCurrentPosition(d, 'node');
                  // $('#node__' + graph.selectedNodes[0] + ' .node').contextMenu();
                } else if (graph.selectedGroups.length > 0) {
                  graph.selectedGroups.map(function (id, i) {
                    if (i > 0) {
                      graph.initState.nodes[id]._selected = false;
                    }
                  });
                  graph.selectedGroups.splice(0, graph.selectedNodes.length - 1); //keep last
                  graph.selectedNodes = [];
                  graph.selectedLinks = [];
                  d = initState.nodes[graph.selectedGroups[0]];
                  restartN(1);
                  d._selected = true;
                  d3.select("#group__" + d.id).select(".group-ok").style("opacity", d._selected ? 1 : 0);
                  graph.contextMenuPosition = getCurrentPosition(d, 'group');
                  var el = $('#group__' + d.id + ' .group');
                  if (el.length) {
                    el.contextMenu();
                  }
                  // makeEditable(d3.select("#group__" + d.id).select(".group-edittext").node(), d, 'group');
                  // graph.contextMenuPosition = getCurrentPosition(d, 'group');
                  // $('#group__' + graph.selectedGroups[0] + ' .group').contextMenu();
                } else if (graph.selectedLinks.length > 0) {
                  graph.selectedLinks.map(function (id, i) {
                    if (i < graph.selectedNodes.length - 1) {
                      graph.initState.nodes[id]._selected = false;
                    }
                  });
                  graph.selectedNodes.splice(0, graph.selectedNodes.length - 1); //keep last
                  graph.selectedGroups.map(function (id) {
                    graph.initState.nodes[id]._selected = false;
                  });
                  graph.selectedGroups = [];
                  graph.selectedNodes.map(function (id) {
                    graph.initState.nodes[id]._selected = false;
                  });
                  graph.selectedNodes = [];
                  state.links.map(function (c) {
                    if (c.id == graph.selectedLinks[0]) {
                      d = c;
                    }
                  });
                  restartN(1);
                  d._selected = true;
                  d3.select("#link__" + d.id).select(".link-ok").style("opacity", d._selected ? 1 : 0);
                  graph.contextMenuPosition = getCurrentPosition(d, 'link');
                  var el = $('#link__' + d.id);
                  if (el.length) {
                    el.contextMenu();
                  }
                  // makeEditable(d3.select("#link-edittext__" + d.id).node(), d, 'link');
                  // makeEditable(d3.select("#link-settings__" + d.id).node(), d, 'link');
                  // graph.contextMenuPosition = getCurrentPosition(d, 'link');
                  // $('#link__' + graph.selectedLinks[0]).contextMenu();
                } else {
                  // if (graph.firstLoad || (graph.selectedNodes.length === 0 && graph.selectedGroups.length === 0 && graph.selectedLinks.length === 0)) {
                  // set select first node
                  var key = d3.keys(graph.initState.nodes)[0]; //Object.keys(graph.initState.nodes).map(function(key, index) {
                  d = graph.initState.nodes[key];
                  d._selected = true;
                  if (d.level === 0) {
                    graph.selectedNodes.push(d.id);
                  } else {
                    graph.selectedGroups.push(d.id);
                  }
                  restartN(1);
                  if (d.level === 0) {
                    d3.select("#node__" + d.id).select(".node-ok").style("opacity", d._selected ? 1 : 0);
                    graph.contextMenuPosition = getCurrentPosition(d, "node");
                    var el = $("#node__" + d.id + ' .node');
                    if (el.length) {
                      el.contextMenu();
                    }
                  } else {
                    d3.select("#group__" + d.id).select(".node-ok").style("opacity", d._selected ? 1 : 0);
                    graph.contextMenuPosition = getCurrentPosition(d, "group");
                    var el = $("#group__" + d.id + ' .group');
                    if (el.length) {
                      el.contextMenu();
                    }
                  }
                  // }
                }
                d3.event.stopPropagation();
                d3.event.preventDefault(); //disabled init Enter in area
                graph.keyPress = false;
              })
              .on('z', function () { //keyup, keydown, keypress  // goBack
                if ((d3.event.ctrlKey || d3.event.metaKey) && d3.event.which == 90 && graph.sessionStorageIndex > 0) { //z key
                  var initStateFromSessionStorage = JSON.parse(sessionStorage.getItem("state-" + graph.sessionStorageIndex));
                  // console.log("state-" + graph.sessionStorageIndex, initStateFromSessionStorage);
                  if (initStateFromSessionStorage) {
                    initState = null;
                    graph.initState = null;
                    initState = initStateFromSessionStorage;
                    graph.initState = initStateFromSessionStorage;
                    sessionStorage.removeItem("state-" + graph.sessionStorageIndex);
                    graph.sessionStorageIndex--;
                    restartWithSessionStorage();
                  }
                }
              })
              // .on('v', function () {
              //   if (d3.event.ctrlKey || d3.event.metaKey) {
              //     console.log('v2');
              //   }
              // })
            );
          svg = d3.select(this).append('svg')
            .attr("id", "thesvg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .call(graph.zoom)
            .on("dblclick.zoom", null)
            .on("click.zoom", null)
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null)
            .on("dblclick", function (e) {
              var id = dblclickAddNode(this, false, false);
              graph.initState.nodes[id]._selected = true;
              graph.selectedNodes.push(id);
              restartN(2);
            });

          backgroundRect = svg.append("rect")
            .attr("id", "background-rect")
            .style("fill", graph.parameters.backgroundColour)
            .style("stroke-width", 0)
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .on('click', function () {
              graph.selectedLinks = [];
              graph.initState.links.map(function (d) {
                d._selected = false;
              });
              graph.selectedNodes = [];
              graph.selectedGroups = [];
              var keys = d3.keys(graph.initState.nodes);
              keys.map(function (key) {
                graph.initState.nodes[key]._selected = false;
              });
              resetMouseVars();
              // $(".makeEditable").focusout(); //focusout blur 
              d3.selectAll(".foreign-object").remove();
              restartN(1);
            });
          graphTitleText = svg.append("text")
            .attr("id", "graph-title")
            .style("font-family", "'Helvetica Neue',Helvetica,Arial,sans-serif")
            .style('stroke', 'none')
            .style("cursor", "default")
            .style("stroke-width", 0)
            .style("text-anchor", graph.parameters.titleTextAnchor)
            .attr('x', width / 2)
            .attr('y', (10 + graph.parameters.titleTextSize));
          permalinkOnGraphText = svg.append("text")
            .attr("id", "graph-permalink")
            .style("font-family", "'Helvetica Neue',Helvetica,Arial,sans-serif")
            .style('stroke', 'none')
            .style("stroke-width", 0)
            .style("font-size", "14px")
            .style("fill", "#777777")
            .style("text-anchor", "start")
            .style("pointer-events", "none")
            .attr('x', 0)
            .attr('y', height - 5);

          gridLineG = svg.append("g").attr('class', 'grid-line-group').style("display", "none");
          var N = Math.round(width / graph.parameters.verticalGap);
          Array.apply(null, {
            length: N
          }).map(Number.call, Number).map(function (d, i) {
            gridLineG.append("line")
              .attr("class", "grid-line")
              .attr("x1", i * graph.parameters.verticalGap)
              .attr("y1", 0)
              .attr("x2", i * graph.parameters.verticalGap)
              .attr("y2", height);

          });
          N = Math.round(height / graph.parameters.horizontalGap);
          Array.apply(null, {
            length: N
          }).map(Number.call, Number).map(function (d, i) {
            gridLineG.append("line")
              .attr("class", "grid-line")
              .attr("x1", 0)
              .attr("y1", i * graph.parameters.horizontalGap)
              .attr("x2", width)
              .attr("y2", i * graph.parameters.horizontalGap);
          });

          defs = svg.append("defs");
          defs.append("marker")
            .attr("id", "arrow")
            .attr("orient", "auto")
            .attr("preserveAspectRatio", "none")
            // See also http://www.w3.org/TR/SVG/coords.html#ViewBoxAttribute
            //.attr("viewBox", "0 -" + arrowWidth + " 10 " + (2 * arrowWidth))
            .attr("viewBox", "0 -5 10 10")
            // See also http://www.w3.org/TR/SVG/painting.html#MarkerElementRefXAttribute
            .attr("refX", 10)
            .attr("refY", 0)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .append("path")
            .style("skroke", "red")
            .attr("d", "M0,-5L10,0L0,5");

          g = svg.append("g").attr('class', 'main-group');
          groupG = g.append("g").attr('class', 'group-group');
          nodeG = g.append("g").attr('class', 'node-group');
          linkG = g.append("g").attr('class', 'link-group');
          arrowG = g.append("g").attr('class', 'arrow-group');
          dragLine = g.append('svg:path')
            .style("pointer-events", "none")
            .style("stroke", "#000")
            .style("fill", "#000")
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0');
        }

        graph._imageFill = isBackgroundTooBlack(graph.parameters.backgroundColour, false);
        svg
          .attr('width', width)
          .attr('height', height);
        backgroundRect
          .style("fill", graph.parameters.backgroundColour)
          .attr('width', width)
          .attr('height', height);
        graphTitleText
          .style("fill", graph.parameters.titleTextColour)
          .style('font-size', graph.parameters.titleTextSize)
          .style('opacity', graph.parameters.titleTextOpacity)
          .style('text-anchor', graph.parameters.titleTextAnchor)
          .attr('x', width / 2)
          .attr('y', (10 + graph.parameters.titleTextSize))
          .html(graph.parameters.titleName);
        permalinkOnGraphText
          .attr('x', 0)
          .attr('y', height - 5)
          .style("fill", graph.parameters.titleTextColour)
          .style("display", graph.parameters.isGraphPermalink ? "block" : "none")
          .html(window.location.href);
        force.size([width, height]);


        // Call onTick each frame of the force directed layout.
        force.on("tick", function (e) {
          onTick(e);
        });
        // force.stop();
        if (!initState.nodes || !initState.links) {
          alert('Error! Not valid data!');
          return;
        }

        state.nodes = d3.values(initState.nodes);
        state.links = linkLinksToNodes(initState.nodes, initState.links);
        force.nodes(state.nodes).links(state.links).start();

        if (graph.firstLoad) {
          graph.firstLoad = false;
          var keys = d3.keys(graph.initState.nodes);
          if (keys.length === 0) {
            return;
          }
          var key = keys[0];
          graph.initState.nodes[key]._selected = true;
          if (graph.initState.nodes[key].level === 0) {
            graph.selectedNodes.push(graph.initState.nodes[key].id);
          } else {
            graph.selectedGroups.push(graph.initState.nodes[key].id);
          }
        }

        // Stop propagation of drag events here so that both dragging nodes and panning are possible.
        var initStateLocal;
        var coordsLocal = [0, 0];
        var coordsForFixLocal = [0, 0];
        force.drag().on("dragstart", function (d) {
          initStateLocal = JSON.parse(JSON.stringify(graph.initState));
          coordsLocal = d3.mouse(this);
          var bBox = d3.select(this).node().getBBox();
          coordsForFixLocal = [-bBox.x + coordsLocal[0], -bBox.y + coordsLocal[1]];
          d3.event.sourceEvent.stopPropagation();
          gridLineG.style("display", null);
        });
        force.drag().on("drag", function (d) {
          if (!d._dragable) {
            d3.event.sourceEvent.stopPropagation();
            d3.event.sourceEvent.preventDefault();
            force.stop();
            return;
          }
          if (d.level >= 1 && d._dragable) {
            var coords = d3.mouse(this);
            coords[0] = coords[0] - coordsForFixLocal[0];
            coords[1] = coords[1] - coordsForFixLocal[1] + graph.imageSize;
            if (graph.initState.nodes[d.id].selectedNodes !== undefined) {
              var node = d3.select("#group__" + d.id);
              node.select(".group").attr("x", coords[0]).attr("y", coords[1]).style("fill", "none").style("stroke", "red");
              if (graph.initState.nodes[d.id].level === 0) {
                node.select(".group-ok").attr("x", coords[0] + graph.imageSize).attr("y", (coords[1] || 0) - graph.imageSize);
                node.select(".group-settings").attr("x", (d.width + coords[0] - graph.imageSize) || 0).attr("y", ((d.y || 0) - graph.imageSize) || 0);
                // node.select(".group-edittext").attr("x", (d.width + coords[0] - graph.imageSize * 2) || coords[0] || 0).attr("y", ((d.y || 0) - graph.imageSize) || 0);
                node.select(".group-move").attr("x", coords[0] || 0).attr("y", ((d.y || 0) - graph.imageSize) || 0);
              }
            }
          }
        });
        // Fix node positions after the first time the user clicks and drags a node.
        force.drag().on("dragend", function (d) {
          gridLineG.style("display", "none");
          d3.event.sourceEvent.stopPropagation();
          d3.event.sourceEvent.preventDefault();
          // Stop the dragged node from moving.
          d.fixed = true;

          if (graph.mouseupNode && graph.mousedownNode) {
            resetMouseVars();
            initState.nodes[d.id].x = lastNodeXBeforeAddLink;
            initState.nodes[d.id].y = lastNodeYBeforeAddLink;
            initState.nodes[d.id].px = lastNodeXBeforeAddLink;
            initState.nodes[d.id].py = lastNodeYBeforeAddLink;
            restartN(1);
          }
          var enable = false;
          var keys = d3.keys(graph.initState.nodes);
          keys.map(function (key) {
            if (graph.initState.nodes[key].level > 0 && graph.initState.nodes[key].selectedNodes !== undefined) {
              graph.initState.nodes[key].selectedNodes.map(function (c) {
                if (c === d.id) {
                  enable = true;
                }
              });
            }
          });

          if (d._changeGroup) {
            return;
          }
          if (enable) {
            restartN(1);
          }

          if (d.level >= 1 && d._dragable) {
            graph.isZoom = false;
            var coords = d3.mouse(this);
            if (coords[0] == coordsLocal[0] && coords[1] == coordsLocal[1]) {
              return;
            }
            if (graph.initState.nodes[d.id].selectedNodes !== undefined) {
              graph.initState.nodes[d.id].selectedNodes.map(function (nodeId) {
                if (graph.initState.nodes[nodeId].level === 0) {
                  if (!initStateLocal) {
                    return;
                  }
                  if (!coordsLocal) {
                    coordsLocal = [0, 0];
                  }
                  var x = initStateLocal.nodes[nodeId].x + (coords[0] - coordsLocal[0]);
                  var y = initStateLocal.nodes[nodeId].y + (coords[1] - coordsLocal[1]);
                  graph.initState.nodes[nodeId].x = x;
                  graph.initState.nodes[nodeId].y = y;
                  graph.initState.nodes[nodeId].px = x;
                  graph.initState.nodes[nodeId].py = y;
                  d3.select("#node__" + nodeId).attr("transform", "translate(" + x + "," + y + ")");
                } else {
                  findChildrenWithLevel0(nodeId, coords, coordsLocal, initStateLocal);
                }
              });
              graph.selectedNodes = [];
              graph.selectedGroups = [];
              restartN(2);
            }
          }
          restartN(1); //need for refresh group-label position
        });


        var levels = d3.nest()
          .key(function (d) {
            return d.level;
          })
          .entries(state.nodes)
          .sort(function (a, b) {
            return d3.descending(a.key, b.key);
          });

        if (levels.length === 1) { //only node => need remove old group
          d3.selectAll(".g-group").remove();
        }

        try {
          levels.reverse().map(function (level) {
            if (level.key > 0) {
              level.values.map(function (group) {
                if (group.selectedNodes !== undefined) {
                  var n = d3.select("#group__" + group.id).select(".group-label").node();
                  if (n) {
                    var bBox = n.getBBox();
                    group.nameHeight = bBox.height;
                  }
                  var minX = d3.min(group.selectedNodes, function (c) {
                    return initState.nodes[c].x;
                  });
                  var maxX = d3.max(group.selectedNodes, function (c) {
                    return initState.nodes[c].x + initState.nodes[c].width;
                  });
                  var maxXWidth = d3.max(group.selectedNodes, function (c) {
                    return initState.nodes[c].x + initState.nodes[c].width;
                  });
                  var maxWidht = d3.max(group.selectedNodes, function (c) {
                    return initState.nodes[c].width;
                  });
                  var maxHeight = d3.max(group.selectedNodes, function (c) {
                    return initState.nodes[c].height;
                  });
                  var minY = d3.min(group.selectedNodes, function (c) {
                    if (initState.nodes[c].level === 0) {
                      return initState.nodes[c].y - initState.nodes[c].height / 2;
                    }
                    return initState.nodes[c].y;
                  });
                  var maxY = d3.max(group.selectedNodes, function (c) {
                    if (initState.nodes[c].level === 0) {
                      return initState.nodes[c].y + initState.nodes[c].height / 2;
                    }
                    return initState.nodes[c].y + initState.nodes[c].height;
                  });
                  group.width = maxX - minX + backgroundNodeAdditionSize * 2;
                  group.height = maxY - minY + backgroundNodeAdditionSize * 2 + group.nameHeight;
                  group.x = minX - backgroundNodeAdditionSize;
                  group.y = minY - backgroundNodeAdditionSize - group.nameHeight;
                  group.px = group.x;
                  group.py = group.y;
                }
              });
              recursive(level.values);
            } else {
              if (graph.isZoom) {
                level.values.map(function (node) {
                  if (node.fixedVerticalGap) {
                    node.x = Math.round(node.x / graph.parameters.verticalGap) * graph.parameters.verticalGap;
                    initState.nodes[node.id].x = node.x;
                    initState.nodes[node.id].px = node.x;
                    return;
                  }
                  node.x = Math.round(node.x / graph.parameters.verticalGap) * graph.parameters.verticalGap;
                  node.y = Math.round(node.y / graph.parameters.horizontalGap) * graph.parameters.horizontalGap;
                  initState.nodes[node.id].x = node.x;
                  initState.nodes[node.id].px = node.x;
                  initState.nodes[node.id].y = node.y;
                  initState.nodes[node.id].py = node.y;
                });

                recursive(level.values);
                graph.fixedVerticalGapFeedback = [];
                recursiveIfNodeOverlaps(level.values);
              }
              graph.isZoom = true;
            }
          });
        } catch (e) {
          console.log("Error! ", e);
        }


        levels.reverse().map(function (level) {
          if (level.key == 0) {

            var node = nodeG.selectAll(".g-node").data(level.values)
              .each(function (d) {
                var node = d3.select(this).node();
                if (!d.tooltip && $(node).hasClass("tooltipstered")) {
                  $(node).tooltipster('destroy');
                  return;
                }
                if(d.tooltip && !$(node).hasClass("tooltipstered")){
                  $(node).tooltipster({
                    maxWidth: 300,
                    side: 'top',
                    content: '<div class="template">' + d.tooltip + '</div>',
                    contentAsHTML: true,
                    theme: 'tooltipster-light'
                  });
                }
              });
            var nodeEnter = node.enter().append("g")
              .attr("id", function (d) {
                return "node__" + d.id;
              })
              .style("pointer-events", "bounding-box")
              .attr("class", "g-node " + "level__" + level.key)
              .on('mouseover', function (d) {
                var parent = d3.select(this);
                parent.select(".node-settings").style("opacity", graph.imageOpacityLink);
                parent.select(".node-move").style("opacity", graph.imageOpacityLink)
                parent.select(".node-movebetweengroups").style("opacity", graph.imageOpacityLink);
              })
              .on('mouseout', function (d) {
                var parent = d3.select(this);
                parent.select(".node-settings").style("opacity", graph.imageOpacity);
                parent.select(".node-move").style("opacity", graph.imageOpacity)
                parent.select(".node-movebetweengroups").style("opacity", graph.imageOpacity);
              })
              .call(force.drag);

            nodeEnter.append("rect").attr("class", "node")
              .style("stroke-width", graph.parameters.nodeBorderWidth)
              .style("stroke", graph.parameters.nodeBorderColour)
              .style("fill", graph.parameters.nodeColour)
              .style("fill-opacity", graph.parameters.nodeOpacity)
              .style("cursor", "pointer")
              .on('mousedown.drag', null)
              .on("contextmenu", function (d) {
                d._selected = true;
                graph.selectedNodes.push(d.id);
                d3.select(this.parentNode).select(".node-ok").style("opacity", d._selected ? 1 : 0);
                graph.contextMenuPosition = getCurrentPosition(d, 'node');
                var el = $('#node__' + d.id + ' .node');
                if (el.length) {
                  el.contextMenu();
                }
              })
              .on("click", function (d) {
                d._dragable = false;
                d._changeGroup = false;
                d._selected = d._selected !== undefined ? !d._selected : true;
                if (d._selected) {
                  graph.selectedNodes.push(d.id);
                } else {
                  graph.selectedNodes = graph.selectedNodes.filter(function (c) {
                    return c !== d.id;
                  });
                }
                d3.select(this.parentNode).select(".node-ok").style("opacity", d._selected ? 1 : 0);
              })
              .on('mousedown', function (d) {
                graph.isZoom = true;
                d._dragable = true;
                d._changeGroup = false;
              })
              .on('mouseover', function (d) {
                d3.select(this).style("stroke", "red");
              })
              .on('mouseout', function (d) {
                d3.select(this).style("stroke", d.stroke || graph.parameters.nodeBorderColour);
              })
              .on('mouseup', function (d) {
                d._dragable = false;
                d._changeGroup = false;
                if (!graph.mousedownNode) return;

                // needed by FF
                dragLine
                  .classed('hidden', true)
                  .style('marker-end', '');

                // check for drag-to-self
                graph.mouseupNode = d;

                if (d3.event.which === 3 || needAddLink < 5) { //contextmenu
                  resetMouseVars();
                  return;
                }
                mouseupAddLink(initState, false);

                restartN(1);
              });

            nodeEnter.append("text").attr("class", "node-label")
              .style("font-family", "'Helvetica Neue',Helvetica,Arial,sans-serif")
              .style("fill", function (d) {
                return d.textFill || graph.parameters.nodeTextColour;
              })
              .style('font-size', '16px')
              .style('stroke', 'none')
              .style('pointer-events', 'none')
              .on('mousedown', function (d) {
                d._dragable = false;
                d._changeGroup = false;
              });

            nodeEnter.append("text").attr("class", "node-ok node-icon")
              .style("opacity", 0)
              .attr("width", graph.imageSize)
              .attr("height", graph.imageSize)
              .on("click", function (d) {
                d._selected = !d._selected;
                restartN(1);
              })
              .each(function (d) {
                var node = d3.select(this).node();
                // $(node).tooltipster();
                // $(node).tooltipster('destroy');
                $(node).tooltipster({
                  maxWidth: 300,
                  side: 'top',
                  content: '<div class="template">Selected</div>',
                  contentAsHTML: true,
                  theme: 'tooltipster-shadow' // http://iamceege.github.io/tooltipster/
                });
              })
              .html("\u2713");
            nodeEnter.append("text").attr("class", "node-square node-icon")
              .style("opacity", 0)
              .attr("width", graph.imageSize)
              .attr("height", graph.imageSize)
              .on("click", function (d) {
                d.fixedVerticalGap = !d.fixedVerticalGap;
                restartN(1);
              })
              .each(function (d) {
                var node = d3.select(this).node();
                $(node).tooltipster({
                  maxWidth: 300,
                  side: 'top',
                  content: '<div class="template">Fixed vertical separation</div>',
                  contentAsHTML: true,
                  theme: 'tooltipster-shadow'
                });
              })
              .html("\u21a8");
            nodeEnter.append("text").attr("class", "node-settings node-icon")
              .style("pointer-events", "all")
              .style("opacity", graph.imageOpacity)
              .attr("width", graph.imageSize)
              .attr("height", graph.imageSize)
              .on("click", function (d) {
                d._selected = true;
                graph.selectedNodes.push(d.id);
                d3.select(this.parentNode).select(".node-ok").style("opacity", d._selected ? 1 : 0);
                graph.contextMenuPosition = getCurrentPosition(d, 'node');
                var el = $('#node__' + d.id + ' .node');
                if (el.length) {
                  el.contextMenu();
                }
              })
              .each(function (d) {
                var node = d3.select(this).node();
                $(node).tooltipster({
                  maxWidth: 300,
                  side: 'top',
                  content: '<div class="template">Settings</div>',
                  contentAsHTML: true,
                  theme: 'tooltipster-shadow'
                });
              })
              .html("\u2699");


            nodeEnter.append("text").attr("class", "node-move node-icon")
              .style("opacity", graph.imageOpacity)
              .attr("width", graph.imageSize * 2)
              .attr("height", graph.imageSize)
              .style("cursor", "default")
              .on('mouseover', function (d) {
                // d3.select(this).style("fill", "aliceblue");
                d3.select(this.parentNode).select(".move-node-label").style("fill", "#000");
                if (!graph.mousedownNode || d === graph.mousedownNode) return;
              })
              .on('mouseout', function (d) {
                // d3.select(this).style("fill", "transparent");
                d3.select(this.parentNode).select(".move-node-label").style("fill", "transparent");
                if (!graph.mousedownNode || d === graph.mousedownNode) return;
              })
              .on('mousedown', function (d) {
                needAddLink = 0;
                d._dragable = false;
                d._changeGroup = false;
                if (d3.event.ctrlKey) return;
                graph.mousedownNode = d;
                lastNodeXBeforeAddLink = graph.mousedownNode.x;
                lastNodeYBeforeAddLink = graph.mousedownNode.y;
                dragLine
                  .style('marker-end', 'url(#arrow)')
                  .classed('hidden', false)
                  .attr('d', 'M' + graph.mousedownNode.x + ',' + graph.mousedownNode.y + 'L' + graph.mousedownNode.x + ',' + graph.mousedownNode.y);
                restartN(1);
              })
              .on('mouseup', function (d) {
                d._dragable = false;
                d._changeGroup = false;

                if (!graph.mousedownNode) return;

                // needed by FF
                dragLine
                  .classed('hidden', true)
                  .style('marker-end', '');

                // check for drag-to-self
                graph.mouseupNode = d;

                if (d3.event.which === 3 || needAddLink < 5) { //contextmenu
                  resetMouseVars();
                  return;
                }
                mouseupAddLink(initState, false);

                restartN(1);
              })
              .each(function (d) {
                var node = d3.select(this).node();
                $(node).tooltipster({
                  maxWidth: 300,
                  side: 'top',
                  content: '<div class="template">Drag to create Arrow</div>',
                  contentAsHTML: true,
                  theme: 'tooltipster-shadow'
                });
              })
              .html("\u27a6");

            nodeEnter.append("text").attr("class", "node-movebetweengroups node-icon")
              .style("opacity", graph.imageOpacity)
              .attr("width", graph.imageSize * 2)
              .attr("height", graph.imageSize)
              .on('mousedown', function (d) {
                graph.isZoom = true;
                d._dragable = true;
                d._changeGroup = true;
              })
              .on('mousemove', function (d) {
                if (d._dragable) {
                  var keys = d3.keys(graph.initState.nodes);
                  var onePush = true;
                  keys.map(function (key) {
                    var group = graph.initState.nodes[key];
                    if (group.selectedNodes !== undefined) {
                      if (group.x < d.x && group.y < d.y && (group.x + group.width) > (d.x) && (group.y + group.height) > (d.y)) {
                        d3.select("#group__" + group.id).select(".group")
                          .style("stroke", "red");
                      } else {
                        d3.select("#group__" + group.id).select(".group")
                          .style("stroke", d.stroke || graph.parameters.groupBorderColour);
                      }
                    }
                  });
                }
              })
              .on('mouseup', function (d) {
                graph.isZoom = true;
                d._dragable = false;
                var keys = d3.keys(graph.initState.nodes);
                var onePush = true;
                keys.map(function (key) {
                  var group = graph.initState.nodes[key];
                  if (group.selectedNodes !== undefined) {
                    graph.initState.nodes[key].selectedNodes = group.selectedNodes.filter(function (c) {
                      return c !== d.id; // && group.selectedNodes.length > 1;
                    });
                    if (graph.initState.nodes[key].selectedNodes.length === 0) {
                      graph.initState.nodes[key].selectedNodes.push(d.id);
                      return;
                    }
                    var needPush = false;

                    if (group.x < d.x && group.y < d.y && (group.x + group.width) > (d.x) && (group.y + group.height) > (d.y)) { //&& group.level === 1
                      needPush = true;
                    }
                    if (needPush && onePush) {
                      graph.initState.nodes[key].selectedNodes.push(d.id);
                      onePush = false;
                    }
                    graph.initState.nodes[key].selectedNodes = graph.initState.nodes[key].selectedNodes.filter(onlyUnique);
                  }
                });
                d._changeGroup = false;
                graph.selectedNodes = [];
                d3.select(".group-group").selectAll("*").remove();
                restartN(1);
              })
              .each(function (d) {
                var node = d3.select(this).node();
                $(node).tooltipster({
                  maxWidth: 300,
                  side: 'top',
                  content: '<div class="template">Drag to move Variable in and out of Groups</div>',
                  contentAsHTML: true,
                  theme: 'tooltipster-shadow'
                });
              })
              .html("\u279f");


            if (getBrowserName() == "Safari") {
              node.select(".node-label") //text-anchor: end;
                .style("fill", function (d) {
                  return d.textFill || graph.parameters.nodeTextColour;
                })
                .style("font-size", function (d) {
                  if (!d.fontSize) {
                    d.fontSize = graph.parameters.nodeTextSize || 14;
                  }
                  return d.fontSize + "px";
                })
                .attr("x", function (d) {
                  if (d.textAnchor === "start") {
                    return textLeftPadding;
                  } else if (d.textAnchor === "middle") {
                    return d.width / 2;
                  }
                  return d.width - textLeftPadding;
                })
                .style("text-anchor", function (d) {
                  return d.textAnchor;
                })
                .attr("dy", "0em")
                .text(function (d) {
                  return d.name.trim();
                })
                .each(function (d) {
                  var textBox = d3.select(this).node().getBBox();
                  if (textBox.width < d.width && d.name.indexOf("///") < 0) {
                    d.height = textBox.height + 2 + textHorizontalPadding * 2;
                    return;
                  }
                  var g = d3.select(this.parentNode);

                  var rect = g.select("rect");
                  var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    additional = 0,
                    lineHeight = 1.2,
                    y = parseInt(text.attr("y")) || +text.attr("y"),
                    x = +text.attr("x"),
                    dy = parseFloat(text.attr("dy"));

                  var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y || 0).attr("dy", (dy || additional) + "em");
                  while (word = words.pop()) {
                    line.push(word);
                    if (line[0] === "") {
                      line.shift(); //remove first empty index
                    }
                    tspan.text(line.join(" "));
                    if ((tspan.node().getComputedTextLength() || 0) > ((+d.width) - textLeftPadding) || word === "///") {
                      line.pop();
                      line = line.filter(function (l) {
                        return l !== "///";
                      });
                      if (word === "///") {
                        word = "";
                      }
                      tspan.text(line.join(" "));
                      line = [word];

                      tspan = text.append("tspan").attr("x", x).attr("y", y || 0).attr("dy", ++lineNumber * lineHeight + additional + (dy || 0) + "em").text(word);

                      text.selectAll("tspan").attr("y", y || 0).attr("x", x);
                      rect.attr("y", (y - 13) || 0);
                    }
                  }
                  textBox = d3.select(this).node().getBBox();
                  var textHeight = textBox.height + 2 + textHorizontalPadding * 2;
                  d.height = textHeight;
                  initState.nodes[d.id].height = textHeight;
                })
                .attr("y", function (d) {
                  return -d.height / 2 + graph.imageSize + textHorizontalPadding;
                });
            } else {
              node.select(".node-label")
                .style("fill", function (d) {
                  return d.textFill || graph.parameters.nodeTextColour;
                })
                .style("font-size", function (d) {
                  if (!d.fontSize) {
                    d.fontSize = graph.parameters.nodeTextSize || 14;
                  }
                  return d.fontSize + "px";
                })
                .attr("x", function (d) {
                  if (d.textAnchor === "start") {
                    return textLeftPadding;
                  } else if (d.textAnchor === "middle") {
                    return d.width / 2;
                  }
                  return d.width - textLeftPadding;
                })
                .style("text-anchor", function (d) {
                  return d.textAnchor;
                })
                .attr("dy", "0em")
                .html(function (d) {
                  return d.name.trim();
                })
                .each(function (d) {
                  if (getBrowserName() == "MSIE" || isMicrosoft()) {
                    d3.select(this).text(d.name.trim());
                    textBox = d3.select(this).node().getBBox();
                    var textHeight = textBox.height + 2 + textHorizontalPadding * 2;
                    var textWidth = textBox.width + textLeftPadding * 2;
                    d.height = textHeight;
                    d.width = textWidth > d.width ? textWidth : d.width;
                    return;
                  }
                  var textBox = d3.select(this).node().getBBox();
                  if (textBox.width < d.width && d.name.indexOf("///") < 0) {
                    d.height = textBox.height + 2 + textHorizontalPadding * 2;
                    return;
                  }
                  var g = d3.select(this.parentNode);

                  var rect = g.select("rect");
                  var text = d3.select(this),
                    words = text.html().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    additional = 0,
                    lineHeight = 1.2,
                    y = parseInt(text.attr("y")) || +text.attr("y"),
                    x = +text.attr("x"),
                    dy = parseFloat(text.attr("dy"));

                  var tspan = text.html(null).append("tspan").attr("x", x).attr("y", y || 0).attr("dy", (dy || additional) + "em");
                  while (word = words.pop()) {
                    line.push(word);
                    if (line[0] === "") {
                      line.shift(); //remove first empty index
                    }
                    tspan.html(line.join(" "));
                    if ((tspan.node().getComputedTextLength() || 0) > ((+d.width) - textLeftPadding) || word === "///") {
                      line.pop();
                      line = line.filter(function (l) {
                        return l !== "///";
                      });
                      if (word === "///") {
                        word = "";
                      }
                      tspan.html(line.join(" "));
                      line = [word];

                      tspan = text.append("tspan").attr("x", x).attr("y", y || 0).attr("dy", ++lineNumber * lineHeight + additional + (dy || 0) + "em").html(word);

                      text.selectAll("tspan").attr("y", y || 0).attr("x", x);
                      rect.attr("y", (y - 13) || 0);
                    }
                  }
                  textBox = d3.select(this).node().getBBox();
                  var textHeight = textBox.height + 2 + textHorizontalPadding * 2;
                  d.height = textHeight;
                  initState.nodes[d.id].height = textHeight;
                })
                .attr("y", function (d) {
                  return -d.height / 2 + graph.imageSize + textHorizontalPadding;
                });
            }



            node.select(".node")
              .attr("id", function (d) {
                return "node__" + d.id;
              })
              .attr("width", function (d) {
                return d.width;
              })
              .attr("y", function (d) {
                return -d.height / 2;
              })
              .attr("height", function (d) {
                return d.height;
              })
              .style("stroke-width", function (d) {
                return d.strokeWidth;
              })
              .style("fill", function (d) {
                return d.fill;
              })
              .style("stroke", function (d) {
                return d.stroke;
              })
              .style("stroke-dasharray", function (d) {
                return graph.parameters.strokeDasharray[d.strokeDasharray];
              })
              .style("fill-opacity", graph.parameters.nodeOpacity)
              .each(function (d, i) {
                // https://stackoverflow.com/questions/14810506/map-function-for-objects-instead-of-arrays
                var parent = graph.parameters.backgroundColour;
                Object.keys(graph.initState.nodes).map(function (key, index) {
                  if (graph.initState.nodes[key].level === (+d.level) + 1) {
                    graph.initState.nodes[key].selectedNodes.map(function (c) {
                      if (c == d.id) {
                        parent = graph.initState.nodes[key].fill || "#fff";
                      }
                    });
                  }
                });
                d._imageFill = isBackgroundTooBlack(parent, true);
                // if (!d.isBadgesBar) { return; }
              });
            node.exit().remove();

            node.select(".node-ok")
              .style("fill", function (d) {
                return d._imageFill;
              })
              .attr("x", graph.imageSize)
              .attr("y", function (d) {
                return -d.height / 2 - graph.imageSize + 13;
              })
              .style("opacity", function (d) {
                if (graph.selectedNodes.length === 0) {
                  d._selected = false;
                }
                return d._selected ? 1 : 0;
              });
            node.exit().remove();

            node.select(".node-square")
              .style("fill", function (d) {
                return d._imageFill;
              })
              .attr("x", graph.imageSize * 2)
              .attr("y", function (d) {
                return -d.height / 2 - graph.imageSize + 11;
              })
              .style("opacity", function (d) {
                return d.fixedVerticalGap ? 1 : 0;
              });
            node.exit().remove();

            node.select(".node-settings")
              .style("fill", function (d) {
                return d._imageFill;
              })
              .attr("x", 0)
              .attr("y", function (d) {
                return -d.height / 2 - graph.imageSize + 13;
              });
            node.exit().remove();


            node.select(".node-move")
              .style("fill", function (d) {
                return d._imageFill;
              })
              .attr("x", function (d) {
                return d.width - graph.imageSize * 1;
              })
              .attr("y", function (d) {
                return -d.height / 2 - graph.imageSize + 13;
              });
            node.exit().remove();

            node.select(".node-movebetweengroups")
              .style("fill", function (d) {
                return d._imageFill;
              })
              .attr("x", function (d) {
                return d.width - graph.imageSize * 2.5;
              })
              .attr("y", function (d) {
                return -d.height / 2 - graph.imageSize + 13;
              });
            node.exit().remove();


          } else {
            var node = groupG.selectAll(".level__" + level.key).data(level.values)
              .each(function (d) {
                var node = d3.select(this).node();
                if (!d.tooltip && $(node).hasClass("tooltipstered")) {
                  $(node).tooltipster('destroy');
                  return;
                }
                if(d.tooltip && !$(node).hasClass("tooltipstered")){
                  $(node).tooltipster({
                    maxWidth: 300,
                    side: 'top',
                    content: '<div class="template">' + d.tooltip + '</div>',
                    contentAsHTML: true,
                    theme: 'tooltipster-light'
                  });
                }
              });

            var nodeEnter = node.enter().append("g")
              .attr("id", function (d) {
                return "group__" + d.id;
              })
              .attr("class", "g-group " + "level__" + level.key)
              .on('mouseover', function (d) {
                var parent = d3.select(this);
                parent.select(".group-settings").style("opacity", graph.imageOpacityLink);
                parent.select(".group-move").style("opacity", graph.imageOpacityLink);
              })
              .on('mouseout', function (d) {
                var parent = d3.select(this);
                parent.select(".group-settings").style("opacity", graph.imageOpacity);
                parent.select(".group-move").style("opacity", graph.imageOpacity);
              })
              .call(force.drag);

            nodeEnter.append("rect").attr("class", "group")
              .style("fill", graph.parameters.groupColour)
              .style("fill-opacity", graph.parameters.groupOpacity)
              .style("stroke-width", graph.parameters.groupBorderWidth)
              .style("stroke", graph.parameters.groupBorderColour)
              .style("pointer-events", "bounding-box")
              .style("cursor", "pointer")
              .on('mousedown.drag', null)
              .on("contextmenu", function (d) {
                d._selected = true;
                graph.selectedGroups.push(d.id);
                d3.select(this.parentNode).select(".group-ok").style("opacity", d._selected ? 1 : 0);
                graph.contextMenuPosition = getCurrentPosition(d, 'group');
                var el = $('#group__' + d.id + ' .group');
                if (el.length) {
                  el.contextMenu();
                }
              })
              .on("click", function (d) {
                d._dragable = false;
                d._changeGroup = false;
                d._selected = d._selected !== undefined ? !d._selected : true;
                if (d._selected) {
                  graph.selectedGroups.push(d.id);
                } else {
                  graph.selectedGroups = graph.selectedGroups.filter(function (c) {
                    return c !== d.id;
                  });
                }
                d3.select(this.parentNode).select(".group-ok").style("opacity", d._selected ? 1 : 0);
              })
              .on('mouseover', function (d) {
                d3.select(this).style("stroke", "red");
              })
              .on('mouseout', function (d) {
                d3.select(this).style("stroke", d.stroke ? d.stroke : graph.parameters.groupBorderColour);
              })
              .on('mousedown', function (d) {
                graph.isZoom = false;
                d._dragable = true;
                d._changeGroup = false;
              })
              .on('mouseup', function (d) {
                graph.isZoom = true;
                if (!graph.mousedownNode) return;

                // needed by FF
                dragLine
                  .classed('hidden', true)
                  .style('marker-end', '');

                // check for drag-to-self
                graph.mouseupNode = d;
                var drAdditional = 0;
                var isSelf = false;

                if (d3.event.which === 3 || needAddLink < 5) { //contextmenu
                  resetMouseVars();
                  return;
                }
                if (graph.mouseupNode === graph.mousedownNode) {
                  isSelf = true;
                  drAdditional = 4;
                }

                // remove link if exist
                initState.links = initState.links.filter(function (c) {
                  var flag = (isSelf && (c.source === graph.mousedownNode.id && c.target === graph.mouseupNode.id));
                  if (flag) {
                    d3.select("#link-label__" + c.id).remove();
                  }
                  return !flag;
                });


                initState.links.map(function (c) {
                  if ((c.source === graph.mousedownNode.id && c.target === graph.mouseupNode.id)) {
                    drAdditional = drAdditional + 1;
                  }
                });
                initState.links.push({
                  id: Date.now(),
                  name: "",
                  marker: true,
                  source: graph.mousedownNode.id,
                  target: graph.mouseupNode.id,
                  stroke: graph.parameters.linkBorderColour,
                  strokeWidth: graph.parameters.linkBorderWidth,
                  strokeDasharray: graph.parameters.isLinkAnimation ? "dotted" : "solid",
                  fill: graph.parameters.linkTextColour,
                  drAdditional: drAdditional,
                  fontSize: graph.parameters.linkTextSize || 14,
                  targerPosition: "auto",
                  sourcePosition: "auto"
                });
                restartN(2);
              });

            nodeEnter.append("text").attr("class", "group-label")
              .style("font-family", "'Helvetica Neue',Helvetica,Arial,sans-serif")
              .style("fill", function (d) {
                return d.textFill || graph.parameters.groupTextColour;
              })
              .style('font-size', '16px')
              .style('stroke', 'none')
              .style('pointer-events', 'none');

            nodeEnter.append("text").attr("class", "group-ok group-icon")
              .style("opacity", 0)
              .attr("width", graph.imageSize)
              .attr("height", graph.imageSize)
              .on("click", function (d) {
                d._selected = !d._selected;
                restartN(1);
              })
              .each(function (d) {
                var node = d3.select(this).node();
                $(node).tooltipster({
                  maxWidth: 300,
                  side: 'top',
                  content: '<div class="template">Selected</div>',
                  contentAsHTML: true,
                  theme: 'tooltipster-shadow'
                });
              })
              .html("\u2713");

            nodeEnter.append("text").attr("class", "group-settings group-icon")
              .style("pointer-events", "all")
              .style('cursor', 'pointer')
              .style("opacity", graph.imageOpacity)
              .attr("width", graph.imageSize)
              .attr("height", graph.imageSize)
              .on("click", function (d) {
                d._selected = true;
                graph.selectedGroups.push(d.id);
                d3.select(this.parentNode).select(".group-ok").style("opacity", d._selected ? 1 : 0);
                graph.contextMenuPosition = getCurrentPosition(d, 'group');
                var el = $('#group__' + d.id + ' .group');
                if (el.length) {
                  el.contextMenu();
                }
              })
              .each(function (d) {
                var node = d3.select(this).node();
                $(node).tooltipster({
                  maxWidth: 300,
                  side: 'top',
                  content: '<div class="template">Settings</div>',
                  contentAsHTML: true,
                  theme: 'tooltipster-shadow'
                });
              })
              .html("\u2699");


            nodeEnter.append("text").attr("class", "group-move group-icon")
              .style("pointer-events", "all")
              .style("opacity", graph.imageOpacity)
              .attr("width", graph.imageSize * 2)
              .attr("height", graph.imageSize)
              .style("cursor", "default")
              .on('mouseover', function (d) {
                if (!graph.mousedownNode || d === graph.mousedownNode) return;
              })
              .on('mouseout', function (d) {
                if (!graph.mousedownNode || d === graph.mousedownNode) return;
              })
              .on('mousedown', function (d) {
                needAddLink = 0;
                d._dragable = false;
                d._changeGroup = false;
                if (d3.event.ctrlKey) return;
                graph.mousedownNode = d;
                lastNodeXBeforeAddLink = graph.mousedownNode.x;
                lastNodeYBeforeAddLink = graph.mousedownNode.y;
                dragLine
                  .style('marker-end', 'url(#arrow)')
                  .classed('hidden', false)
                  .attr('d', 'M' + graph.mousedownNode.x + ',' + graph.mousedownNode.y + 'L' + graph.mousedownNode.x + ',' + graph.mousedownNode.y);
                restartN(1);
              })
              .on('mouseup', function (d) {
                // d._dragable = false;
                // d._changeGroup = false;
                if (!graph.mousedownNode) return;

                // needed by FF
                dragLine
                  .classed('hidden', true)
                  .style('marker-end', '');

                // check for drag-to-self
                graph.mouseupNode = d;
                var drAdditional = 0;
                var isSelf = false;

                if (d3.event.which === 3 || needAddLink < 5) { //contextmenu
                  resetMouseVars();
                  return;
                }
                if (graph.mouseupNode === graph.mousedownNode) {
                  isSelf = true;
                  drAdditional = 4;
                }

                // remove link if exist
                initState.links = initState.links.filter(function (c) {
                  var flag = (isSelf && (c.source === graph.mousedownNode.id && c.target === graph.mouseupNode.id));
                  if (flag) {
                    d3.select("#link-label__" + c.id).remove();
                  }
                  return !flag;
                });


                initState.links.map(function (c) {
                  if ((c.source === graph.mousedownNode.id && c.target === graph.mouseupNode.id)) {
                    drAdditional = drAdditional + 1;
                  }
                });
                initState.links.push({
                  id: Date.now(),
                  name: "",
                  marker: true,
                  source: graph.mousedownNode.id,
                  target: graph.mouseupNode.id,
                  stroke: graph.parameters.linkBorderColour,
                  strokeWidth: graph.parameters.linkBorderWidth,
                  strokeDasharray: graph.parameters.isLinkAnimation ? "dotted" : "solid",
                  fill: graph.parameters.linkTextColour,
                  drAdditional: drAdditional,
                  fontSize: graph.parameters.linkTextSize || 14,
                  targerPosition: "auto",
                  sourcePosition: "auto"
                });
                restartN(2);
              })
              .each(function (d) {
                var node = d3.select(this).node();
                $(node).tooltipster({
                  maxWidth: 300,
                  side: 'top',
                  content: '<div class="template">Drag to create Arrow</div>',
                  contentAsHTML: true,
                  theme: 'tooltipster-shadow'
                });
              })
              .html("\u27a6");


            if (getBrowserName() == "Safari") {
              node.select(".group-label")
                .style("fill", function (d) {
                  return d.textFill || graph.parameters.groupTextColour;
                })
                .style("font-size", function (d) {
                  if (!d.fontSize) {
                    d.fontSize = d.fontSize = graph.parameters.groupTextSize || 20;
                  }
                  return d.fontSize + "px";
                })
                .attr("x", function (d) {
                  if (d.textAnchor === "start") {
                    return d.x + textLeftPadding;
                  } else if (d.textAnchor === "middle") {
                    return d.x + d.width / 2;
                  }
                  return d.x + d.width - textLeftPadding;
                })
                .style("text-anchor", function (d) {
                  return d.textAnchor;
                })
                .text(function (d) {
                  return d.name.trim();
                })
                .each(function (d) {
                  var g = d3.select(this.parentNode);
                  var rect = g.select("rect");
                  var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    additional = 0,
                    lineHeight = 1.2,
                    y = parseInt(text.attr("y")) || +text.attr("y"),
                    x = +text.attr("x"),
                    dy = parseFloat(text.attr("dy"));
                  var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y || 0).attr("dy", (dy || 0) + "em");
                  while (word = words.pop()) {
                    line.push(word);
                    if (line[0] === "") {
                      line.shift();
                    }
                    tspan.text(line.join(" "));
                    if ((tspan.node().getComputedTextLength() || 0) > ((+d.width) - textLeftPadding) || word === "///") {
                      line.pop();
                      line = line.filter(function (l) {
                        return l !== "///";
                      });
                      if (word === "///") {
                        word = "";
                      }
                      tspan.text(line.join(" "));
                      line = [word];
                      tspan = text.append("tspan").attr("x", x).attr("y", y || 0).attr("dy", ++lineNumber * lineHeight + additional + (dy || 0) + "em").text(word);
                      text.selectAll("tspan").attr("y", y).attr("x", x);
                      rect.attr("y", (y - 13) || 0);
                    }
                  }
                  var textBox = d3.select(this).node().getBBox();
                  var textHeight = textBox.height + 2 + textHorizontalPadding * 2;
                  d.nameHeight = textHeight > 20 ? textHeight : 0;
                })
                .attr("y", function (d) {
                  return (d.y + 16 + textHorizontalPadding * 2) || 0;
                })
                .attr("dy", "0em");
            } else {
              node.select(".group-label")
                .style("fill", function (d) {
                  return d.textFill || graph.parameters.groupTextColour;
                })
                .style("font-size", function (d) {
                  if (!d.fontSize) {
                    d.fontSize = graph.parameters.groupTextSize || 20;
                  }
                  return d.fontSize + "px";
                })
                .attr("x", function (d) {
                  if (d.textAnchor === "start") {
                    return d.x + textLeftPadding;
                  } else if (d.textAnchor === "middle") {
                    return d.x + d.width / 2;
                  }
                  return d.x + d.width - textLeftPadding;
                })
                .style("text-anchor", function (d) {
                  return d.textAnchor;
                })
                .html(function (d) {
                  return d.name.trim();
                })
                .each(function (d) {
                  if (getBrowserName() == "MSIE" || isMicrosoft()) {
                    d3.select(this).text(d.name.trim());
                    textBox = d3.select(this).node().getBBox();
                    var textHeight = textBox.height + 2 + textHorizontalPadding * 2;
                    d.nameHeight = textHeight > 20 ? textHeight : 0;
                    var textWidth = textBox.width + textLeftPadding * 2;
                    return;
                  }
                  var g = d3.select(this.parentNode);
                  var rect = g.select("rect");
                  var text = d3.select(this),
                    words = text.html().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    additional = 0,
                    lineHeight = 1.2,
                    y = parseInt(text.attr("y")) || +text.attr("y"),
                    x = +text.attr("x"),
                    dy = parseFloat(text.attr("dy"));
                  var tspan = text.html(null).append("tspan").attr("x", x).attr("y", y || 0).attr("dy", (dy || 0) + "em");
                  while (word = words.pop()) {
                    line.push(word);
                    if (line[0] === "") {
                      line.shift(); //remove first empty index
                    }
                    tspan.html(line.join(" "));
                    if ((tspan.node().getComputedTextLength() || 0) > ((+d.width) - textLeftPadding) || word === "///") {
                      line.pop();
                      line = line.filter(function (l) {
                        return l !== "///";
                      });
                      if (word === "///") {
                        word = "";
                      }
                      tspan.html(line.join(" "));
                      line = [word];
                      tspan = text.append("tspan").attr("x", x).attr("y", y || 0).attr("dy", ++lineNumber * lineHeight + additional + (dy || 0) + "em").html(word);
                      text.selectAll("tspan").attr("y", y).attr("x", x);
                      rect.attr("y", (y - 13) || 0);
                    }
                  }
                  var textBox = d3.select(this).node().getBBox();
                  var textHeight = textBox.height + 2 + textHorizontalPadding * 2;
                  d.nameHeight = textHeight > 20 ? textHeight : 0;
                })
                .attr("y", function (d) {
                  return (d.y + 16 + textHorizontalPadding * 2) || 0;
                })
                .attr("dy", "0em");
            }
            node.exit().remove();



            node.select(".group")
              .attr("id", function (d) {
                return "group__" + d.id;
              })
              .style("stroke-width", function (d) {
                return d.strokeWidth;
              })
              .style("stroke", function (d) {
                return d.stroke;
              })
              .style("fill", function (d) {
                return d.fill;
              })
              .style("stroke-dasharray", function (d) {
                return graph.parameters.strokeDasharray[d.strokeDasharray];
              })
              .style("fill-opacity", graph.parameters.groupOpacity)
              .attr("x", function (d) {
                return d.x;
              })
              .attr("y", function (d) {
                return d.y || 0;
              })
              .attr("width", function (d) {
                return d.width;
              })
              .attr("height", function (d) {
                return d.height || 0;
              })
              .each(function (d) {
                if (d.id == graph.selectedGroups[0] && graph.selectedGroups.length === 1) {
                  d._selected = true;
                }
                var parent = graph.parameters.backgroundColour;
                Object.keys(graph.initState.nodes).map(function (key, index) {
                  if (graph.initState.nodes[key].level === (+d.level) + 1) {
                    graph.initState.nodes[key].selectedNodes.map(function (c) {
                      if (c == d.id) {
                        parent = graph.initState.nodes[key].fill || "#fff";
                      }
                    });
                  }
                });
                d._imageFill = isBackgroundTooBlack(parent, true);
              });
            node.exit().remove();

            node.select(".group-ok")
              .style("fill", function (d) {
                return d._imageFill;
              })
              .attr("x", function (d) {
                return d.x + graph.imageSize * 1;
              })
              .attr("y", function (d) {
                return (d.y || 0) - graph.imageSize + 10;
              })
              .style("opacity", function (d) {
                if (graph.selectedGroups.length === 0) {
                  d._selected = false;
                }
                return d._selected ? 1 : 0;
              });
            node.exit().remove();

            node.select(".group-settings")
              .style("fill", function (d) {
                return d._imageFill;
              })
              .attr("x", function (d) {
                return d.x || 0;
              })
              .attr("y", function (d) {
                return ((d.y || 0) - graph.imageSize + 13) || 0;
              });
            node.exit().remove();


            node.select(".group-move")
              .style("fill", function (d) {
                return d._imageFill;
              })
              .attr("x", function (d) {
                return (d.width + d.x - graph.imageSize * 1) || d.x || 0;
              })
              .attr("y", function (d) {
                return ((d.y || 0) - graph.imageSize + 13) || 0;
              });
            node.exit().remove();
          }

        });


        defs.selectAll(".arrow-marker").remove();
        var marker = defs.selectAll(".arrow-marker").data(state.links);
        marker.enter()
          .append("marker")
          .attr("class", "arrow-marker")
          .style("fill", function (d) {
            return d.stroke || graph.parameters.linkBorderColour;
          })
          .style("pointer-events", "none")
          .attr("id", function (d) {
            return "arrow-marker___" + d.id;
          })
          .attr("orient", "auto")
          .attr("preserveAspectRatio", "none")
          // See also http://www.w3.org/TR/SVG/coords.html#ViewBoxAttribute
          .attr("viewBox", function (d) {
            return "0 -" + Math.round(graph.markerSize + d.strokeWidth) + " " + Math.round((graph.markerSize + d.strokeWidth) * 2) + " " + Math.round((graph.markerSize + d.strokeWidth) * 2);
          })
          // See also http://www.w3.org/TR/SVG/painting.html#MarkerElementRefXAttribute
          .attr("refX", function (d) {
            return (graph.markerSize + d.strokeWidth) * 2; //+1
          })
          .attr("refY", 0)
          .attr("markerWidth", function (d) {
            return (graph.markerSize + d.strokeWidth) * 2;
          })
          .attr("markerHeight", function (d) {
            return (graph.markerSize + d.strokeWidth) * 2;
          })
          .append("path")
          .attr("class", "marker")
          .attr("id", function (d) {
            return "marker__" + d.id;
          })
          .attr("d", function (d) {
            return "M0,-" + Math.round(graph.markerSize + d.strokeWidth) + "L" + Math.round((graph.markerSize + d.strokeWidth) * 2) + ",0L0," + Math.round(graph.markerSize + d.strokeWidth);
          });
        marker
          .attr("refY", 0)
          .attr("markerWidth", function (d) {
            return (graph.markerSize + d.strokeWidth) * 2;
          })
          .attr("markerHeight", function (d) {
            return (graph.markerSize + d.strokeWidth) * 2;
          });
        marker.select()
          .attr("d", function (d) {
            return "M0,-" + Math.round(graph.markerSize + d.strokeWidth) + "L" + Math.round((graph.markerSize + d.strokeWidth) * 2) + ",0L0," + Math.round(graph.markerSize + d.strokeWidth);
          });
        marker.exit().remove(".marker");

        // animation: sol 4s linear forwards infinite;
        /*https://developer.mozilla.org/en/docs/Web/CSS/animation-direction*/
        /*https://css-tricks.com/svg-line-animation-works/*/
        /*stroke-dashoffset: 1000;*/
        /*normal reverse alternate alternate-reverse, forwards  */

        var linkBackground = linkG.selectAll(".link-background").data(state.links);
        linkBackground.enter().append("path") //link
          .style("fill", "none")
          .attr("id", function (d) {
            return "link-background__" + d.id; //d.node.replace(" ", "__");
          })
          .attr("class", "link-background")
          .style("cursor", "pointer")
          .on('mouseover', function (d) {
            force.stop();
            var parent = d3.select(this.parentNode);
            parent.select("#link-settings__" + d.id).style("opacity", graph.imageOpacityLink);
          })
          .on('mouseenter', function (d) {
            force.stop();
            var parent = d3.select(this.parentNode);
            parent.select("#link-settings__" + d.id).style("opacity", graph.imageOpacityLink);
          })
          .on('mouseleave', function (d) {
            var parent = d3.select(this.parentNode);
            setTimeout(function () {
              parent.select("#link-settings__" + d.id).style("opacity", graph.imageOpacity);
            }, 500);
          })
          .on("contextmenu", function (d) {
            graph.selectedLinks.push(d.id);
            d3.select("#link-ok__" + d.id).style("opacity", 1);
            graph.contextMenuPosition = getCurrentPosition(d, 'link');
            var el = $('#link__' + d.id);
            if (el.length) {
              el.contextMenu();
            }
            d3.event.preventDefault();
            d3.event.stopPropagation();
          })
          .on("click", function (d) {
            d._selected = d._selected ? !d._selected : true;
            if (d._selected) {
              graph.selectedLinks.push(d.id);
            } else {
              graph.selectedLinks = graph.selectedLinks.filter(function (c) {
                return c !== d.id;
              });
            }
            d3.select("#link-ok__" + d.id).style("opacity", d._selected ? 1 : 0);
          });
        linkBackground
          .style("fill", "none")
          .attr("id", function (d) {
            return "link-background__" + d.id;
          })
          .style("stroke", "transparent")
          .style("stroke-width", function (d) {
            return d.strokeWidth * 4;
          })
          .each(function (d) {
            var node = d3.select(this).node();
            if (!d.tooltip && $(node).hasClass("tooltipstered")) {
              $(node).tooltipster('destroy');
              return;
            }
            if(d.tooltip && !$(node).hasClass("tooltipstered")){
              $(node).tooltipster({
                maxWidth: 300,
                side: 'top',
                content: '<div class="template">' + d.tooltip + '</div>',
                contentAsHTML: true,
                theme: 'tooltipster-light'
              });
            }
          });
        linkBackground.exit().remove();


        var link = linkG.selectAll(".link").data(state.links);
        link.enter().append("path")
          .style("fill", "none")
          .style("pointer-events", "none")
          .attr("id", function (d) {
            return "link__" + d.id;
          })
          .on("contextmenu", function (d) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
          })
          .attr("class", function (d) {
            return "link " + "source-line__" + d.linkSource + " " + "target-line__" + d.linkTarget + (graph.parameters.isLinkAnimation ? " link-animation" : "");
          });
        link
          .style("fill", "none")
          .attr("id", function (d) {
            return "link__" + d.id;
          })
          .attr("class", function (d) {
            return "link " + "source-line__" + d.linkSource + " " + "target-line__" + d.linkTarget + (graph.parameters.isLinkAnimation ? " link-animation" : "");
          })
          .style("stroke", function (d) {
            return d.stroke;
          })
          .style("stroke-width", function (d) {
            return d.strokeWidth;
          })
          .style("stroke-dasharray", function (d) {
            return graph.parameters.strokeDasharray[d.strokeDasharray];
          });
        link.exit().remove();


        var linkLabel = linkG.selectAll('.link-label')
          .data(state.links);

        linkLabel.enter()
          .append('svg:text')
          .style("font-family", "'Helvetica Neue',Helvetica,Arial,sans-serif")
          .attr("id", function (d) {
            return "link-label__" + d.id;
          })
          .style("fill", function (d) {
            return d.fill;
          })
          .style("font-size", function (d) {
            if (!d.fontSize) {
              d.fontSize = d.fontSize = graph.parameters.linkTextSize || 14;
            }
            return d.fontSize + "px";
          })
          .attr('pointer-events', 'none')
          .style('text-anchor', function (d) {
            return d.textAnchor;
          })
          .attr('class', 'link-label')
          .html(function (d) {
            return d.name || "";
          });

        linkLabel.exit().remove();

        if (getBrowserName() == "Safari") {
          linkLabel
            .attr("id", function (d) {
              return "link-label__" + d.id;
            })
            .style("fill", function (d) {
              return d.fill;
            })
            .style('text-anchor', function (d) {
              return d.textAnchor;
            })
            .style("font-size", function (d) {
              if (!d.fontSize) {
                d.fontSize = d.fontSize = graph.parameters.linkTextSize || 14;
              }
              return d.fontSize + "px";
            })
            .text(function (d) {
              return d.name.trim() || "";
            })
            .each(function (d) {
              var width = Math.sqrt(Math.pow(d.target.x - d.source.x, 2) + Math.pow(d.target.y - d.source.y, 2));
              var g = d3.select(this.parentNode);
              var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                additional = 0,
                lineHeight = 1.2,
                y = parseInt(text.attr("y")) || +text.attr("y"),
                x = +text.attr("x"),
                dy = parseFloat(text.attr("dy"));
              var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y || 0).attr("dy", (dy || additional) + "em");
              while (word = words.pop()) {
                line.push(word);
                if (line[0] === "") {
                  line.shift(); //remove first empty index
                }
                tspan.text(line.join(" "));
                if ((tspan.node().getComputedTextLength() || 0) > ((width)) || word === "///") {
                  line.pop();
                  line = line.filter(function (l) {
                    return l !== "///";
                  });
                  if (word === "///") {
                    word = "";
                  }
                  tspan.text(line.join(" "));
                  line = [word];

                  tspan = text.append("tspan").attr("x", x).attr("y", y || 0).attr("dy", ++lineNumber * lineHeight + additional + (dy || 0) + "em").text(word);

                  text.selectAll("tspan").attr("y", y || 0).attr("x", x);
                }
              }
            });
        } else {
          linkLabel
            .attr("id", function (d) {
              return "link-label__" + d.id;
            })
            .style("fill", function (d) {
              return d.fill;
            })
            .style('text-anchor', function (d) {
              return d.textAnchor;
            })
            .style("font-size", function (d) {
              if (!d.fontSize) {
                d.fontSize = d.fontSize = graph.parameters.linkTextSize || 14;
              }
              return d.fontSize + "px";
            })
            .html(function (d) {
              return d.name.trim() || "";
            })
            .each(function (d) {
              if (getBrowserName() == "MSIE" || isMicrosoft()) {
                d3.select(this).text(d.name.trim());
                return;
              }
              var width = Math.sqrt(Math.pow(d.target.x - d.source.x, 2) + Math.pow(d.target.y - d.source.y, 2));
              var g = d3.select(this.parentNode);
              var text = d3.select(this),
                words = text.html().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                additional = 0,
                lineHeight = 1.2,
                y = parseInt(text.attr("y")) || +text.attr("y"),
                x = +text.attr("x"),
                dy = parseFloat(text.attr("dy"));
              var tspan = text.html(null).append("tspan").attr("x", x).attr("y", y || 0).attr("dy", (dy || additional) + "em");
              while (word = words.pop()) {
                line.push(word);
                if (line[0] === "") {
                  line.shift(); //remove first empty index
                }
                tspan.html(line.join(" "));
                if ((tspan.node().getComputedTextLength() || 0) > ((width)) || word === "///") {
                  line.pop();
                  line = line.filter(function (l) {
                    return l !== "///";
                  });
                  if (word === "///") {
                    word = "";
                  }
                  tspan.html(line.join(" "));
                  line = [word];

                  tspan = text.append("tspan").attr("x", x).attr("y", y || 0).attr("dy", ++lineNumber * lineHeight + additional + (dy || 0) + "em").html(word);

                  text.selectAll("tspan").attr("y", y || 0).attr("x", x);
                }
              }
            });
        }


        var linkOk = linkG.selectAll('.link-ok')
          .data(state.links);
        linkOk.enter().append("text")
          .attr("id", function (d) {
            return "link-ok__" + d.id;
          })
          .attr("class", "link-ok link-icon")
          .style("opacity", 0)
          .attr("width", graph.imageSize)
          .attr("height", graph.imageSize)
          .on("click", function (d) {
            d._selected = !d._selected;
            restartN(1);
          })
          .each(function (d) {
            var node = d3.select(this).node();
            $(node).tooltipster({
              maxWidth: 300,
              side: 'top',
              content: '<div class="template">Selected</div>',
              contentAsHTML: true,
              theme: 'tooltipster-shadow'
            });
          })
          .html("\u2713");
        linkOk
          // .attr("xlink:href", "img/ok-" + graph._imageFill + ".svg")
          .style("fill", function (d) {
            return graph._imageFill;
          })
          .attr("id", function (d) {
            return "link-ok__" + d.id;
          })
          .style("opacity", function (d) {
            if (graph.selectedLinks.length === 0) {
              d._selected = false;
            } else {
              graph.selectedLinks.map(function (id) {
                if (d.id == id) {
                  d._selected = true;
                } else {
                  d._selected = false;
                }
              });
            }
            return d._selected ? 1 : 0;
          });
        linkOk.exit().remove();

        var linkSettings = linkG.selectAll('.link-settings')
          .data(state.links);
        linkSettings.enter().append("text")
          .attr("id", function (d) {
            return "link-settings__" + d.id;
          })
          .attr("class", "link-settings link-icon")
          .style("pointer-events", "all")
          .style("opacity", graph.imageOpacity)
          .attr("width", graph.imageSize)
          .attr("height", graph.imageSize)
          .each(function (d) {
            var node = d3.select(this).node();
            $(node).tooltipster({
              maxWidth: 300,
              side: 'top',
              content: '<div class="template">Settings</div>',
              contentAsHTML: true,
              theme: 'tooltipster-shadow'
            });
          })
          .html("\u2699");
        linkSettings
          // .attr("xlink:href", "img/settings-" + graph._imageFill + ".svg")
          .style("fill", function (d) {
            return graph._imageFill;
          })
          .attr("id", function (d) {
            return "link-settings__" + d.id;
          })
          .on("click", function (d, i) {
            d = state.links[i];
            graph.selectedLinks.push(d.id);
            d3.select("#link-ok__" + d.id).style("opacity", 1);
            graph.contextMenuPosition = getCurrentPosition(d, 'link');
            var el = $('#link__' + d.id); //!!!
            if (el.length) {
              el.contextMenu();
            }
          });
        linkSettings.exit().remove();



        var arrow = arrowG.selectAll(".arrow").data(state.links);
        arrow.enter().append("path")
          .style("pointer-events", "none")
          .style("fill", "none")
          .attr("class", function (d) {
            return "arrow " + "source-arrow__" + d.linkSource + " " + "target-arrow__" + d.linkTarget;
          }, true)
          .attr("marker-end", function (d) {
            return d.marker ? "url(#arrow-marker___" + d.id + ")" : null;
          });
        arrow
          .style("fill", "none")
          .attr("marker-end", function (d) {
            return d.marker ? "url(#arrow-marker___" + d.id + ")" : null;
          });
        arrow.exit().remove();


        if (graph.fixedVerticalGapFeedback.length > 0) {
          graph.fixedVerticalGapFeedback.map(function (d) {
            var parent = d3.select("#node__" + d.id);
            parent.select(".node-square").attr("class", "node-square node-icon fixed-vertical-gap-feedback");
            setTimeout(function () {
              parent.select(".node-square").attr("class", "node-square node-icon"); //..classed("fixed-vertical-gap-feedback", false);
            }, 2500);
          });
        }
        graph.fixedVerticalGapFeedback = [];
        // Run a modified version of force directed layout
        // to account for link direction going from left to right.
        // This function gets reassigned later, each time new data loads.
        function onTick(e) {
          // Execute left-right constraints
          var k = 1 * e.alpha;
          force.links().forEach(function (link) {
            var a = link.source,
              b = link.target,
              dx = b.x - a.x,
              dy = b.y - a.y,
              d = Math.sqrt(dx * dx + dy * dy),
              x = (a.x + b.x) / 2;
            if (!a.fixed) {
              a.x += k * (x - d / 2 - a.x);
            }
            if (!b.fixed) {
              b.x += k * (x + d / 2 - b.x);
            }
          });

          link.call(edge, false);
          linkBackground.call(edge, false);
          arrow.call(edge, true);

          linkLabel
            .attr("x", function (d) {
              var value = 0;
              if (d.isArrowName) {
                if (d.sourceX > d.targetX) {
                  value = d.targetX + 5;
                } else {
                  value = d.targetX - 5;
                }
                return value;
              }
              if (d.textAnchor === 'middle') {
                value = (d.sourceX + d.targetX) / 2;
              } else if (d.textAnchor === 'start' && d.sourceX < d.targetX) {
                value = d.sourceX + 10;
              } else if (d.textAnchor === 'start' && d.sourceX > d.targetX) {
                value = d.targetX + 10;
              } else if (d.textAnchor === 'end' && d.sourceX < d.targetX) {
                value = d.targetX - 10;
              } else if (d.textAnchor === 'end' && d.sourceX > d.targetX) {
                value = d.sourceX - 10;
              } else { //d.sourceX === d.targetX
                value = d.sourceX;
              }
              d.xLabel = value;
              return value;
            })
            .attr("y", function (d) {
              d.yLabel = (d.sourceY + d.targetY) / 2 + (d.fontSize / 2 || 14 / 2);
              return d.yLabel;
            })
            .each(function (d) {
              var tspan = d3.select(this).selectAll("tspan");
              if (tspan.node() && (+tspan.attr("x") === 0 && +tspan.attr("y") === 0)) {
                tspan.attr("x", d.xLabel);
                tspan.attr("y", d.yLabel);
              }
            });

          linkOk
            .attr("x", function (d, i) {
              d = state.links[i];
              if (d.targetX == d.sourceX) {
                return d.targetX - graph.imageSize;
              }
              return d.targetX + (d.targetX > d.sourceX ? (-graph.imageSize * 3) : (graph.imageSize * 2));
            })
            .attr("y", function (d, i) {
              d = state.links[i];
              if (d.targetX == d.sourceX && d.targetY < d.sourceY) {
                return d.targetY + 15 + graph.imageSize;
              }
              if (d.targetX == d.sourceX && d.targetY > d.sourceY) {
                return d.targetY - 10 - graph.imageSize;
              }
              return (d.targetY + (d.targetY > d.sourceY ? (-graph.imageSize * 1.5) : (graph.imageSize * 0.5))) + 10;
            });

          linkSettings
            .attr("x", function (d, i) {
              d = state.links[i];
              if (d.targetX == d.sourceX) {
                return d.targetX;
              }
              return d.targetX + (d.targetX > d.sourceX ? (-graph.imageSize * 2) : (graph.imageSize));
            })
            .attr("y", function (d, i) {
              d = state.links[i];
              if (d.targetX == d.sourceX && d.targetY < d.sourceY) {
                return d.targetY + 15 + graph.imageSize;
              }
              if (d.targetX == d.sourceX && d.targetY > d.sourceY) {
                return d.targetY - 10 - graph.imageSize;
              }
              return (d.targetY + (d.targetY > d.sourceY ? (-graph.imageSize * 1.5) : (graph.imageSize * 0.5))) + 10;
            });

          d3.selectAll(".g-node")
            .attr("transform", function (d) {
              return "translate(" + d.x + "," + d.y + ")";
            });
        }


        // Sets the (x1, y1, x2, y2) line properties for graph edges.
        function edge(selection, isArrow) {
          //http://bl.ocks.org/mbostock/1153292
          selection
            .each(function (d) {
              var sourceX, targetX, dx, dy, angle;

              if (d.source.id == d.target.id) {
                sourceX = (d.source.x);
                targetX = d.target.x + d.target.width;
              } else if ((d.source.x + d.source.width) < d.target.x) {
                sourceX = (d.source.x + d.source.width);
                targetX = d.target.x;
              } else if ((d.target.x + d.target.width) < d.source.x) {
                targetX = (d.target.x + d.target.width);
                sourceX = d.source.x;
              } else {
                var distanceStart = Math.sqrt(Math.pow(d.target.x - d.source.x, 2) + Math.pow(d.target.y - d.source.y, 2));
                var distanceEnd = Math.sqrt(Math.pow(d.target.x + d.target.width - d.source.x + d.source.width, 2) + Math.pow(d.target.y - d.source.y, 2));
                if (distanceStart < distanceEnd) {
                  targetX = d.target.x;
                  sourceX = d.source.x;
                } else {
                  targetX = d.target.x + d.target.width;
                  sourceX = d.source.x + d.source.width;
                }
              }
              dx = targetX - sourceX;
              dy = d.target.y - d.source.y;
              angle = Math.atan2(dx, dy);
              d.sourceX = sourceX - Math.sin(angle);
              d.targetX = targetX + Math.sin(angle);


              if (d.source.id == d.target.id) {
                if (d.source.level === 0) {
                  d.sourceY = d.source.y + d.target.height / 2;
                } else {
                  d.sourceY = d.source.y + Math.cos(angle) * d.source.height + d.source.height;
                }
                if (d.target.level === 0) {
                  d.targetY = d.target.y + d.target.height / 2;
                } else {
                  d.targetY = d.target.y - Math.cos(angle) * d.target.height + d.target.height;
                }
              } else {
                if (d.source.level === 0) {
                  d.sourceY = d.source.y + Math.cos(angle) * d.source.height / 2 + d.source.level * backgroundNodeAdditionSize * 4;
                } else {
                  d.sourceY = d.source.y + Math.cos(angle) * d.source.height / 2 + d.source.height / 2;
                }
                if (d.target.level === 0) {
                  d.targetY = d.target.y - Math.cos(angle) * d.target.height / 2;
                } else {
                  d.targetY = d.target.y - Math.cos(angle) * d.target.height / 2 + d.target.height / 2;
                  if (d.target.y < d.sourceY && d.sourceY < d.targetY) {
                    d.targetY = d.sourceY;
                  }
                  if (d.target.y > d.sourceY) {
                    d.targetY = d.target.y;
                  }
                }
              }
              var margin = arrowMargin; //arrowMargin;
              if (isArrow) {
                margin = arrowMargin - 1;
              }
              if (Math.round(d.targetX) === Math.round(d.sourceX) && d.targetY > d.sourceY) {
                d.targetY = d.targetY - margin;
                d.sourceY = d.sourceY + margin;
              } else if (Math.round(d.targetX) === Math.round(d.sourceX) && d.targetY < d.sourceY) {
                d.targetY = d.targetY + margin;
                d.sourceY = d.sourceY - margin;
              } else if (d.targetX > d.sourceX) {
                if (d.targetY > d.sourceY) {
                  d.targetY = d.targetY - margin;
                  d.sourceY = d.sourceY + margin;
                } else if (d.targetY < d.sourceY) {
                  d.targetY = d.targetY + margin;
                  d.sourceY = d.sourceY - margin;
                }
              } else {
                if (d.targetY > d.sourceY) {
                  d.targetY = d.targetY - margin;
                  d.sourceY = d.sourceY + margin;
                } else if (d.targetY < d.sourceY) {
                  d.targetY = d.targetY + margin;
                  d.sourceY = d.sourceY - margin;
                }
              }
              // if top arrow start not in corner
              if (d.source.level === 0 && d.target.level === 0 && d.source.x < d.target.x && d.source.y < d.target.y && (d.source.x + d.source.width) > d.target.x) {
                if (d.source.x > (d.source.x + d.source.width) - d.target.x) {
                  d.sourceX = d.source.x + d.source.width;
                  d.targetX = d.sourceX;
                  d.targetY = d.target.y - d.target.height / 2;
                }
                d.sourceY = d.source.y + d.source.height / 2;
              }
              if (d.source.level === 0 && d.target.level === 0 && d.source.x > d.target.x && d.source.y < d.target.y && (d.target.x + d.target.width) > d.source.x) {
                d.targetX = d.sourceX;
                d.targetY = d.target.y - d.target.height / 2;
                d.sourceY = d.source.y + d.source.height / 2;
              }
              if (d.source.level === 0 && d.target.level === 0 && d.target.x < d.source.x && d.target.y < d.source.y && (d.target.x + d.target.width) > d.source.x) {
                if (d.target.x > (d.target.x + d.target.width) - d.source.x) {
                  d.targetX = d.target.x + d.target.width;
                  d.sourceX = d.targetX;
                  d.sourceY = d.source.y - d.source.height / 2;
                }
                d.targetY = d.target.y + d.target.height / 2;
              }
              if (d.source.level === 0 && d.target.level === 0 && d.source.x < d.target.x && d.source.y > d.target.y && (d.source.x + d.source.width) > d.target.x) {
                d.sourceX = d.targetX;
                d.sourceY = d.source.y - d.source.height / 2;
                d.targetY = d.target.y + d.target.height / 2;
              }

              // from group to node and reverse - horizontal line
              if (d.source.level > 0 && d.target.level === 0 && d.target.y > d.source.y && (d.target.y + d.target.height) < (d.source.y + d.source.height)) {
                d.sourceY = d.targetY;
              }
              if (d.source.level > 0 && d.target.level === 0 && d.target.y < d.source.y && (d.target.y + d.target.height) < (d.source.y + d.source.height)) {
                d.sourceY = d.source.y;
              }
              // from group to group and reverse - horizontal line
              if (d.source.level > 0 && d.target.level > 0 && d.target.y > d.source.y && (d.target.y + d.target.height) < (d.source.y + d.source.height)) {
                d.sourceY = d.targetY;
              }
              if (d.source.level > 0 && d.target.level > 0 && d.target.y < d.source.y && (d.target.y + d.target.height) < (d.source.y + d.source.height)) {
                d.sourceY = d.source.y;
                d.targetY = d.target.y + d.target.height;
              }
              if (d.source.level > 0 && d.target.level > 0 && d.target.y < d.source.y && (d.target.y + d.target.height) < (d.source.y + d.source.height) && (d.target.y + d.target.height) > d.source.y) {
                d.sourceY = d.source.y;
                d.targetY = d.source.y;
              }

              if (d.targerPosition === "auto" && d.sourcePosition === "auto") {
                // do nothing
              }
              // top-left, top-right, bottom-left, bottom-right
              if (d.targerPosition === "top-left") {
                d.targetX = d.target.x;
                d.targetY = d.target.y - (d.target.level == 0 ? d.target.height / 2 : 0);
              }
              if (d.targerPosition === "top-right") {
                d.targetX = d.target.x + d.target.width;
                d.targetY = d.target.y - (d.target.level == 0 ? d.target.height / 2 : 0);
              }
              if (d.targerPosition === "bottom-left") {
                d.targetX = d.target.x;
                d.targetY = d.target.y + (d.target.level == 0 ? d.target.height / 2 : d.target.height);
              }
              if (d.targerPosition === "bottom-right") {
                d.targetX = d.target.x + d.target.width;
                d.targetY = d.target.y + (d.target.level == 0 ? d.target.height / 2 : d.target.height);
              }

              if (d.sourcePosition === "top-left") {
                d.sourceX = d.source.x;
                d.sourceY = d.source.y - (d.source.level == 0 ? d.source.height / 2 : 0);
              }
              if (d.sourcePosition === "top-right") {
                d.sourceX = d.source.x + d.source.width;
                d.sourceY = d.source.y - (d.source.level == 0 ? d.source.height / 2 : 0);
              }
              if (d.sourcePosition === "bottom-left") {
                d.sourceX = d.source.x;
                d.sourceY = d.source.y + (d.source.level == 0 ? d.source.height / 2 : d.source.height);
              }
              if (d.sourcePosition === "bottom-right") {
                d.sourceX = d.source.x + d.source.width;
                d.sourceY = d.source.y + (d.source.level == 0 ? d.source.height / 2 : d.source.height);
              }
              // without arrow, and need link container set under nodes container
            })
            .attr("d", function (d) {
              return "M" + d.sourceX + "," + d.sourceY + "L" + d.targetX + "," + d.targetY;
            });
          selection
            .attr("d", function (d) {
              var arcFlag = 1;
              var isRadius = 0;
              var dx = d.targetX - d.sourceX;
              var dy = d.targetY - d.sourceY;
              state.links.map(function (link) {
                if ((d.targetX === link.targetX && d.targetY === link.targetY) || (d.targetX === link.sourceX && d.targetY === link.sourceY)) {
                  isRadius = isRadius + 1;
                  if ((d.dr === 0 && isRadius > 1) || Math.abs(d.drAdditional) > 0) {
                    d.dr = Math.pow(Math.sqrt(dx * dx + dy * dy), 1) * 3.14 / Math.pow((Math.abs(d.drAdditional) + 1), 0.6);
                  }
                }
              });

              if (d.linkSource == d.linkTarget) {
                arcFlag = 0;
                d.dr = Math.pow(Math.sqrt(dx * dx + dy * dy), 1.2) * 3.14 / Math.pow((Math.abs(d.drAdditional) + 1), 0.6);
              }
              d.dr = Math.round(d.dr);
              if (isRadius > 1 || Math.abs(d.drAdditional) > 0 || d.linkSource == d.linkTarget || d.dr !== 0) {
                if (d.dr < 0) {
                  arcFlag = 0;
                }
                if (d.drAdditional >= 0) {
                  arcFlag = 1;
                } else {
                  arcFlag = 0;
                }

                if (isArrow) {
                  return "M" + d.sourceX + "," + d.sourceY +
                    " A" + d.dr + "," + d.dr + " 0 0," + arcFlag + " " + d.targetX + "," + d.targetY +
                    " A" + d.dr + "," + d.dr + " 0 0," + (arcFlag === 0 ? 1 : 0) + " " + d.sourceX + "," + d.sourceY +
                    " A" + d.dr + "," + d.dr + " 0 0," + arcFlag + " " + d.targetX + "," + d.targetY;
                } else {
                  return "M" + d.sourceX + "," + d.sourceY +
                    " A" + d.dr + "," + d.dr + " 0 0," + arcFlag + " " + d.targetX + "," + d.targetY +
                    " A" + d.dr + "," + d.dr + " 0 0," + (arcFlag === 0 ? 1 : 0) + " " + d.targetX + "," + d.targetY;
                }
              } else {
                return "M" + d.sourceX + "," + d.sourceY + "L" + d.targetX + "," + d.targetY;
              }
            });

        }


        svg.on('mousedown', function () {
            svg.classed('active', true);
            if (d3.event.ctrlKey || graph.mousedownNode) return;
          })
          .on('mousemove', function () {
            if (!graph.mousedownNode) return;
            needAddLink = needAddLink + 1; //if needAddLink<5(~) - it is click event - don't need add link
            var coords = d3.mouse(g.node()); //this
            dragLine.attr('d', 'M' + graph.mousedownNode.x + ',' + graph.mousedownNode.y + 'L' + coords[0] + ',' + coords[1]);
          })
          .on('mouseup', function () {
            // hide drag line
            var isReverse = d3.event.ctrlKey ? true : false;
            dragLine
              .classed('hidden', true)
              .style('marker-end', '');
            // because :active only works in WebKit?
            svg.classed('active', false);
            // clear mouse event vars
            if (graph.mousedownNode && !graph.mouseupNode) {
              var id = dblclickAddNode(this, false, false);
              graph.initState.nodes[id]._selected = true;
              graph.selectedNodes.push(id);
              graph.mouseupNode = {};
              graph.mouseupNode.id = id;
              mouseupAddLink(initState, isReverse);
              restartN(2);
              resetMouseVars();
            }
          });


      });
    }

    render.width = function (_x) {
      if (!arguments.length) return width;
      width = parseInt(_x);
      return this;
    };

    render.height = function (_x) {
      if (!arguments.length) return height;
      height = parseInt(_x);

      gridLineG.selectAll("*").remove();
      var N = Math.round(width / graph.parameters.verticalGap);
      Array.apply(null, {
        length: N
      }).map(Number.call, Number).map(function (d, i) {
        gridLineG.append("line")
          .attr("class", "grid-line")
          .attr("x1", i * graph.parameters.verticalGap)
          .attr("y1", 0)
          .attr("x2", i * graph.parameters.verticalGap)
          .attr("y2", height);

      });
      N = Math.round(height / graph.parameters.horizontalGap);
      Array.apply(null, {
        length: N
      }).map(Number.call, Number).map(function (d, i) {
        gridLineG.append("line")
          .attr("class", "grid-line")
          .attr("x1", 0)
          .attr("y1", i * graph.parameters.horizontalGap)
          .attr("x2", width)
          .attr("y2", i * graph.parameters.horizontalGap);
      });
      return this;
    };

    return d3.rebind(render);
  };



  graph.div = d3.select(graph.id);
  graph.rebinded = graph.rebind();



  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function setParameterByName(m_str, name, val) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "([\\?&])" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(m_str);
    if (results == null) {
      if (m_str == '')
        return m_str + "?" + name + "=" + val;
      else
        return m_str + "&" + name + "=" + val;
    } else {
      return m_str.replace(regex, results[1] + name + "=" + val);
    }
  }

  // init
  if (getBrowserName() == "Safari" || getBrowserName() == "MSIE" || isMicrosoft()) {
    // https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_alert
    var div = d3.select("body").insert("div", ".main").attr("class", "alert warning").style("top", "50px");
    div.append("span").attr("class", "closebtn").on("click", function () {
      d3.select(".alert.warning").remove();
    }).html("&times;");
    div.append("strong").html("Warning! ");
    div.append("span").html("Sorry - your browser doesn't support all functionality! Please try Chrome or Firefox or Opera.");
  }

  var permalink = getParameterByName("permalink");
  if (permalink === null) { //window.location.hash
    permalink = "default";
    window.location.search = setParameterByName("", "permalink", permalink);
  }

  $(document).ready(function () {
    getTooltipster();
    getThemes(function () {
      getData(permalink);
    });
    setTimeout(function () {
      refresh();
      clearTimeout();
    }, 2000);
  });



  function getThemes(callback) { //:String
    $.ajax({
      type: 'POST',
      url: "/getdata",
      datatype: "json",
      data: {
        "permalink": "__predefined__themes__"
      },
      success: function (result) { //done
        if (!result) {
          return;
        }
        graph.themes = JSON.parse(result);
        d3.select("#parameter-themes").selectAll("*").remove();
        var themesSelect = d3.select("#parameter-themes");
        Object.keys(graph.themes).map(function (objectKey) {
          themesSelect.append("option").text(objectKey);
        });
        var t = themesSelect.node().value;
        var theme = graph.themes[t || "default"];
        if (theme) {
          var changeExistingItems = $("#parameter-change-existing-items").prop("checked");
          graph.parameters = theme;
          setGraphParameters();
        }
      },
      error: function () { //fail
        // console.log("Error!"); 
      },
      complete: function () { //always
        if ($.isFunction(callback)) {
          callback();
        }
      }
    });
  }

  function setTooltipster(result) {
    if (result) {
      graph.tooltipster = JSON.parse(result);
    }
    d3.select("#tooltipter-container").selectAll("*").remove();
    Object.keys(graph.tooltipster).map(function (objectKey) {
      var tooltip = d3.select(graph.tooltipster[objectKey].selector + objectKey)
        .attr("data-tooltip-content", "." + objectKey + "-content");
      d3.select("#tooltipter-container")
        .append("span")
        .attr("class", objectKey + "-content tooltipter-content")
        .text(graph.tooltipster[objectKey].text);
      // var textNode = d3.select('text.my-class').node(),  // DOM node
      // parentNode = textNode.parentNode,              // Parent DOM node
      // parentSelection = d3.select(parentNode),       // Selection containing the parent DOM node
      // circle = parentSelection.select('circle');     // selection containing a circle under the parent selection
      $(graph.tooltipster[objectKey].selector + objectKey).tooltipster({
        theme: 'tooltipster-light'
      });
    });
  }

  function getTooltipster() { //:String
    $.ajax({
      type: 'POST',
      url: "/getdata",
      datatype: "json",
      data: {
        "permalink": "__predefined__tooltipster__"
      },
      success: function (result) {
        if (!result) {
          return;
        }
        graph.tooltipster = JSON.parse(result);
        Object.keys(graph.tooltipster).map(function (objectKey) {
          var tooltip = d3.selectAll(graph.tooltipster[objectKey].selector + objectKey)
            .attr("data-tooltip-content", "." + objectKey + "-content");
          d3.select("#tooltipter-container")
            .append("span")
            .attr("class", objectKey + "-content tooltipter-content")
            .text(graph.tooltipster[objectKey].text);
          // var textNode = d3.select('text.my-class').node(),  // DOM node
          // parentNode = textNode.parentNode,              // Parent DOM node
          // parentSelection = d3.select(parentNode),       // Selection containing the parent DOM node
          // circle = parentSelection.select('circle');     // selection containing a circle under the parent selection
          $(graph.tooltipster[objectKey].selector + objectKey).tooltipster({
            theme: 'tooltipster-light'
          });
        });
      },
      error: function () {
        // console.log("Error!", window.location); 
      }
    });
  }

  function getData(permalink) { //[A-Za-z0-9]
    $.ajax({
      type: 'POST',
      url: "/getdata",
      datatype: "json",
      data: {
        "permalink": permalink
      },
      success: function (result) {
        if (!result) {
          $("#parameter-permalink-name").val("default");
          window.location.search = setParameterByName("", "permalink", "default");
          return;
        }
        $("#parameter-permalink-name").val(permalink);
        localStorage.setItem('theorymakerPermalink', permalink);
        if (permalink === "default") {
          $(".saved-link").css("display", "none");
        } else {
          $("#saved-link-a").attr("href", window.location.href).html(window.location.href);
          $("#saved-i-link-a").attr("href", window.location.origin + "/img/" + permalink + ".png").html(window.location.origin + "/img/" + permalink + ".png");
        }


        var json = JSON.parse(result);
        if (json.graph) {
          graph.initState = json.graph;
        }
        if (json.parameters) {
          graph.parameters = json.parameters;
          setGraphParameters();

          $("#diagram-panel-content").removeClass('collapsed');
          $("#variable-panel-content").removeClass('collapsed');
          $("#group-panel-content").removeClass('collapsed');
          $("#arrow-panel-content").removeClass('collapsed');
          var height = $("#save-panel-content>div").height() + 15;
          $("#save-panel-content").css("height", height + "px");
          $("#save-panel-label").removeClass('collapsed');
          setGlobalPanel(graph);
          $("#diagram-panel-content").addClass('collapsed');
          $("#variable-panel-content").addClass('collapsed');
          $("#group-panel-content").addClass('collapsed');
          $("#arrow-panel-content").addClass('collapsed');
        }
        restartN(3);
      },
      error: function () {
        // console.log("Error!", window.location); 
        var permalink = "default";
        $("#parameter-permalink-name").val(permalink);
        $(".saved-link").css("display", "none");
        var json = {
          "graph": {
            "nodes": {
              "1491725732120": {
                "id": "1491725732120",
                "name": "Success -  /// we hope!",
                "nameHeight": 0,
                "textAnchor": "start",
                "fill": "#FDD0A2",
                "stroke": "#525252",
                "strokeWidth": 1.5,
                "level": 0,
                "fixed": 1,
                "x": 480,
                "y": 350,
                "width": 155,
                "height": 44.78125,
                "strokeDasharray": "solid",
                "fontSize": 14,
                "index": 0,
                "weight": 2,
                "px": 480,
                "py": 350,
                "_seleted": false,
                "_dragable": false,
                "_changeGroup": false,
                "_selected": false,
                "_imageFill": "black"
              },
              "1491725736496": {
                "id": "1491725736496",
                "name": "Effort",
                "nameHeight": 0,
                "textAnchor": "start",
                "fill": "#C7E9C0",
                "stroke": "#525252",
                "strokeWidth": 1.5,
                "level": 0,
                "fixed": 1,
                "x": 240,
                "y": 300,
                "width": 155,
                "height": 27.984375,
                "strokeDasharray": "solid",
                "fontSize": 14,
                "index": 1,
                "weight": 1,
                "px": 240,
                "py": 300,
                "_seleted": false,
                "_dragable": false,
                "_changeGroup": false,
                "_imageFill": "black",
                "_selected": false
              },
              "1491725742526": {
                "id": "1491725742526",
                "name": "Resources",
                "nameHeight": 0,
                "textAnchor": "start",
                "fill": "#C7E9C0",
                "stroke": "#525252",
                "strokeWidth": 1.5,
                "level": 0,
                "fixed": 1,
                "x": 240,
                "y": 350,
                "width": 155,
                "height": 27.984375,
                "strokeDasharray": "solid",
                "fontSize": 14,
                "index": 2,
                "weight": 1,
                "px": 240,
                "py": 350,
                "_seleted": false,
                "_dragable": false,
                "_changeGroup": false,
                "_imageFill": "black",
                "_selected": false
              },
              "1491725736497": {
                "id": "1491725736497",
                "name": "Inputs",
                "nameHeight": 34.65625,
                "textAnchor": "start",
                "fill": "#9E9AC8",
                "stroke": "#3F007D",
                "strokeWidth": 2,
                "level": 1,
                "fixed": 1,
                "selectedNodes": ["1491725736496", "1491725742526"],
                "strokeDasharray": "solid",
                "fontSize": 20,
                "index": 3,
                "weight": 0,
                "x": 215,
                "y": 226.3515625,
                "px": 215,
                "py": 226.3515625,
                "width": 205,
                "height": 190.625,
                "_dragable": false,
                "_changeGroup": false,
                "_imageFill": "black",
                "_selected": false
              },
              "1494524068144": {
                "id": 1494524068144,
                "name": "Outputs",
                "textAnchor": "start",
                "fill": "#9E9AC8",
                "stroke": "#3F007D",
                "strokeWidth": 2,
                "level": 1,
                "fixed": 1,
                "selectedNodes": ["1491725732120"],
                "strokeDasharray": "solid",
                "index": 4,
                "weight": 0,
                "x": 455,
                "y": 267.953125,
                "px": 455,
                "py": 267.953125,
                "width": 205,
                "height": 174.21875,
                "nameHeight": 34.65625,
                "_dragable": false,
                "_changeGroup": false,
                "fontSize": 20,
                "_imageFill": "black",
                "_selected": false
              }
            },
            "links": [{
              "id": 1494524041389,
              "name": "",
              "marker": true,
              "source": "1491725736496",
              "target": "1491725732120",
              "stroke": "#238B45",
              "strokeWidth": 2.5,
              "strokeDasharray": "dotted",
              "fill": "#000000",
              "_selected": false
            }, {
              "id": 1494524080451,
              "name": "",
              "marker": true,
              "source": "1491725742526",
              "target": "1491725732120",
              "stroke": "#238B45",
              "strokeWidth": 2.5,
              "strokeDasharray": "dotted",
              "fill": "#000000",
              "_selected": false
            }]
          },
          "parameters": {
            "backgroundColour": "#F7FBFF",
            "titleTextColour": "#000000",
            "titleTextSize": 24,
            "groupBorderColour": "#3F007D",
            "groupBorderWidth": 2,
            "groupColour": "#9E9AC8",
            "groupOpacity": 0.4,
            "groupTextColour": "#525252",
            "groupTextSize": 20,
            "horizontalGap": 50,
            "linkBorderColour": "#238B45",
            "linkBorderWidth": 1.5,
            "linkTextColour": "#000000",
            "nodeBorderColour": "#525252",
            "nodeBorderWidth": 1.5,
            "nodeColour": "#C7E9C0",
            "nodeOpacity": 1,
            "nodeTextColour": "#525252",
            "nodeTextSize": 14,
            "nodeWidth": 155,
            "strokeDasharray": {
              "dashed": "6,3",
              "dotted": "2,3",
              "solid": "none"
            },
            "verticalGap": 30,
            "isLinkAnimation": true,
            "isGraphPermalink": false,
            "replaceSomeText": [{
              "from": "!heart",
              "to": "&#x2764;"
            }, {
              "from": "!wedge",
              "to": "&#x25ba;"
            }]
          }
        };
        graph.initState = json;
        if (json.graph) {
          graph.initState = json.graph;
        }
        if (json.parameters) {
          graph.parameters = json.parameters;
          setGraphParameters();
          $("#diagram-panel-content").removeClass('collapsed');
          $("#variable-panel-content").removeClass('collapsed');
          $("#group-panel-content").removeClass('collapsed');
          $("#arrow-panel-content").removeClass('collapsed');
          $("#save-panel-label").removeClass('collapsed');
          setGlobalPanel(graph);
          $("#diagram-panel-content").addClass('collapsed');
          $("#variable-panel-content").addClass('collapsed');
          $("#group-panel-content").addClass('collapsed');
          $("#arrow-panel-content").addClass('collapsed');
        }
        restartN(3);
      }
    });
  }


  // https://tombigel.github.io/detect-zoom/
  function refresh() {
    var zoom = detectZoom.zoom();
    var device = detectZoom.device();
    $(".context-menu-list").hide();
    var iconSize = 14;

    graph.mainContainer.selectAll(".animation-arrow").style("display", "none");
  }

  window.addEventListener("resize", function () { // $(window).on('resize', refresh);
    var h = (window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight) - 65;
    var width = d3.select(graph.id).node().offsetWidth || d3.select("#d3-graph-container").node().offsetWidth; // use css min-width
    if (width) {
      width = width - (graph.margin.left + graph.margin.right);
      graph.div.call(graph.rebinded.width(width));
    }
    if (h !== graph.h) {
      graph.h = h;
      d3.select("#d3-graph-container").style("height", graph.h + "px");
      graph.div.call(graph.rebinded.height(graph.h));
    }
    refresh();
  });


  function restartN(n) {
    var currentGraph = JSON.stringify(graph.initState);
    graph.sessionStorageIndex++;
    sessionStorage.setItem("state-" + graph.sessionStorageIndex, currentGraph);
    var i;
    for (i = 0; i <= n; i++) {
      restart();
    }
  }

  function restart() {
    graph.div.datum(graph.initState).call(graph.rebinded);
  }


  $("#bt-undo").click(function () { // goBack
    var initStateFromSessionStorage = JSON.parse(sessionStorage.getItem("state-" + graph.sessionStorageIndex));
    if (initStateFromSessionStorage) {
      graph.initState = null;
      graph.initState = initStateFromSessionStorage;
      sessionStorage.removeItem("state-" + graph.sessionStorageIndex);
      graph.sessionStorageIndex--;
      restartWithSessionStorage();
    }
  });

  function restartWithSessionStorage() {
    graph.div.datum(graph.initState).call(graph.rebinded);
  }

  function linkLinksToNodes(nodes, links) {
    var output = new Array(links.length);
    links.forEach(function (link, i) {
      output[i] = {
        id: link.id,
        name: link.name,
        marker: link.marker,
        stroke: link.stroke,
        strokeWidth: link.strokeWidth,
        strokeDasharray: link.strokeDasharray || "solid",
        fill: link.fill,
        linkSource: link.source,
        linkTarget: link.target,
        source: nodes[link.source],
        target: nodes[link.target],
        drAdditional: link.drAdditional || 0,
        dr: link.dr || 0,
        isArrowName: link.isArrowName || false,
        textAnchor: link.textAnchor || "middle",
        tooltip: link.tooltip || "",
        targerPosition: link.targerPosition || "auto",
        sourcePosition: link.sourcePosition || "auto"
      };
    });
    return output;
  }

  function getAllIndexes(arr, val) {
    var indexes = [],
      i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
      indexes.push(i);
    }
    return indexes;
  }

  function findChildrenWithLevel0(nodeId, coords, coordsLocal, initStateLocal) {
    var d = graph.initState.nodes[nodeId];
    if (d.level === 0) {
      var x = initStateLocal.nodes[nodeId].x + (coords[0] - coordsLocal[0]);
      var y = initStateLocal.nodes[nodeId].y + (coords[1] - coordsLocal[1]);
      graph.initState.nodes[nodeId].x = x;
      graph.initState.nodes[nodeId].y = y;
      graph.initState.nodes[nodeId].px = x;
      graph.initState.nodes[nodeId].py = y;
      d3.select("#node__" + nodeId).attr("transform", "translate(" + x + "," + y + ")");
    } else {
      graph.initState.nodes[d.id].selectedNodes.map(function (nodeId) {
        if (graph.initState.nodes[nodeId].level === 0) {
          var x = initStateLocal.nodes[nodeId].x + (coords[0] - coordsLocal[0]);
          var y = initStateLocal.nodes[nodeId].y + (coords[1] - coordsLocal[1]);
          graph.initState.nodes[nodeId].x = x;
          graph.initState.nodes[nodeId].y = y;
          graph.initState.nodes[nodeId].px = x;
          graph.initState.nodes[nodeId].py = y;
          d3.select("#node__" + nodeId).attr("transform", "translate(" + x + "," + y + ")");
        } else {
          findChildrenWithLevel0(nodeId, coords, coordsLocal, initStateLocal);
        }
      });
    }
  }


  function getCurrentPosition(d, type) {
    var position = {
      x: 0,
      y: 0
    };
    var currentScale = graph.zoom.scale();
    var currentPosition = graph.zoom.translate();

    if (type === 'node') {
      position.x = d.x;
      position.y = d.y - d.height / 2;
    } else if (type === 'group') {
      position.x = d.x;
      position.y = d.y || 0;
    } else if (type === 'link') {
      position.x = (d.sourceX + d.targetX) / 2;
      position.y = (d.sourceY + d.targetY) / 2;
    } else if (type === 'title') {
      position.x = graph.width / 2;
      position.y = 50;
    }
    position.x = position.x + currentPosition[0] + position.x * (currentScale - 1);
    position.y = position.y + currentPosition[1] + position.y * (currentScale - 1);
    return position;
  }

  function replaceSomeText(name, reverse) {
    var newline = String.fromCharCode(13, 10); //&#13;&#10;
    var array = [{
      from: " /// ",
      to: newline
    }];

    if (graph.parameters.replaceSomeText) {
      array = array.concat(graph.parameters.replaceSomeText);
    } else {
      array = array.concat([{
          "from": "!heart",
          "to": "&#x2764;"
        },
        {
          "from": "!wedge",
          "to": "&#x25ba;"
        },
        {
          "from": "!1",
          "to": "▂"
        },
        {
          "from": "!2",
          "to": "▃"
        },
        {
          "from": "!3",
          "to": "▅"
        },
        {
          "from": "!4",
          "to": "▆"
        },
        {
          "from": "!5",
          "to": "▇"
        }
      ]);
    }

    array.map(function (d, i) {
      if (i === 0) {
        if (reverse) {
          name = name.replaceAll(d.to, d.from);
        } else {
          name = name.replaceAll(d.from, d.to);
        }
      } else {
        name = name.replaceAll(d.from, d.to);
      }
    });
    return name;
  }


  function isBackgroundTooBlack(c, isOpacity) {
    c = c.substring(1); // strip #
    var rgb = parseInt(c, 16); // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff; // extract red
    var g = (rgb >> 8) & 0xff; // extract green
    var b = (rgb >> 0) & 0xff; // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    // if (isOpacity) { console.log(c, luma); }
    // console.log(c, " = ", luma, graph.parameters.groupOpacity);
    if (graph.parameters.backgroundColour === "#000000" && graph.parameters.groupOpacity < 0.3) {
      return "white";
    }
    if (graph.parameters.backgroundColour === "#ffffff" && graph.parameters.groupOpacity < 0.3) {
      return "black";
    }
    if (c === "ransparent" || luma < 51 && (graph.parameters.groupOpacity < 0.3)) { // && luma !== 0
      luma = "black"; // pick a different colour
    } else if (luma < 51 || luma === 0) {
      luma = "white"; // pick a different colour
    } else {
      luma = "black";
    }
    return luma;
  }


  function dblclickAddNode(that, coords, id) {
    var currentScale = graph.zoom.scale();
    // var transform = d3.transform(g.attr("transform"));
    var currentPosition = graph.zoom.translate();
    if (!coords) {
      coords = d3.mouse(that);
      coords[0] = (coords[0] - currentPosition[0]) / (currentScale);
      coords[1] = (coords[1] - currentPosition[1]) / (currentScale);
    }
    if (!id) {
      id = Date.now();
    }

    graph.initState.nodes[id] = {
      "id": id,
      "name": "Label",
      "textAnchor": "start",
      "fill": graph.parameters.nodeColour,
      "stroke": graph.parameters.nodeBorderColour,
      "strokeWidth": graph.parameters.nodeBorderWidth,
      "level": 0,
      "fixed": 1,
      "x": coords[0],
      "y": coords[1],
      "width": graph.parameters.nodeWidth,
      "height": 20,
      "strokeDasharray": "solid",
      "textFill": graph.parameters.nodeTextColour,
      "_selected": true
    };
    var keys = d3.keys(graph.initState.nodes);
    if (!that) {
      return id;
    }
    var needPush = true;
    keys.map(function (key) {
      if (graph.initState.nodes[key].level > 0 && graph.initState.nodes[key].selectedNodes !== undefined) {
        if (graph.initState.nodes[key].x < coords[0] && graph.initState.nodes[key].y < coords[1] && graph.initState.nodes[key].level > 0 && (graph.initState.nodes[key].x + graph.initState.nodes[key].width) > (coords[0]) && (graph.initState.nodes[key].y + graph.initState.nodes[key].height) > (coords[1])) {
          graph.initState.nodes[key].selectedNodes.push(id);
          needPush = false;
        }
      }
    });
    graph.selectedGroups = [];
    graph.selectedNodes = [];
    return id;
  }

  function mouseupAddLink(initState, isReverse) {
    var drAdditional = 0;
    var isSelf = false;
    if (graph.mouseupNode === graph.mousedownNode) {
      isSelf = true;
      drAdditional = 4;
    }

    // remove link if exist
    initState.links = initState.links.filter(function (c) {
      var flag = (isSelf && (c.source === graph.mousedownNode.id && c.target === graph.mouseupNode.id));
      if (flag) {
        d3.select("#link-label__" + c.id).remove();
      }
      return !flag;
    });

    initState.links.map(function (c) {
      if ((c.source === graph.mousedownNode.id && c.target === graph.mouseupNode.id)) {
        drAdditional = drAdditional + 1;
      }
    });
    initState.links.push({
      id: Date.now(),
      name: "",
      marker: true,
      source: !isReverse ? graph.mousedownNode.id : graph.mouseupNode.id,
      target: !isReverse ? graph.mouseupNode.id : graph.mousedownNode.id,
      stroke: graph.parameters.linkBorderColour,
      strokeWidth: graph.parameters.linkBorderWidth,
      strokeDasharray: graph.parameters.isLinkAnimation ? "dotted" : "solid",
      fill: graph.parameters.linkTextColour,
      drAdditional: drAdditional,
      fontSize: graph.parameters.linkTextSize || 14,
      targerPosition: "auto",
      sourcePosition: "auto"
    });
  }


})(d3, jQuery, window, document);