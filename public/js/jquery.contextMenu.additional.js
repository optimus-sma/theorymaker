;
(function ($, d3, window) {
  // https://swisnl.github.io/jQuery-contextMenu/demo/custom-command.html



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.slider = function (item, opt, root) {
    $('<p><span>Node width: <span class="parameter-node-width-value">100</span></span><div style="margin-top:3px;" class="parameter-node-width"></div></p>')
      .appendTo(this);
    this.addClass('labels')
      .on('contextmenu:focus', function (e) {
      })
      .on('contextmenu:blur', function (e) {
      })
      .on('click', function (e) {
        d3.select('.parameter-node-width').selectAll("*").remove();
        var d = d3.select(opt.$trigger[0]).data()[0];
        d3.select('.parameter-node-width').call(d3.slider().min(100).value(250).max(500).step(10).on("slide", function (evt, value) {
          d3.select('.parameter-node-width-value').text(value);
        }));
      });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.linkStrokePicker = function (item, opt, root) {
    $('<p>Arrow colour <input id="linkStrokePicker" type="text" value="#ffffff" style="float:right;"></p>')
      .appendTo(this);
    this.addClass('labels')
      .on('contextmenu:focus', function (e) {
        var d = d3.select(opt.$trigger[0]).data()[0];
        $("#linkStrokePicker").icolor({
          colors: window.graph.colors,
          col: window.graph.colorsColumn,
          autoClose: true,
          onSelect: function (c) {
            $('#linkStrokePicker').css("background", c);
            if (window.graph.selectedLinks.length > 0) {
              window.graph.selectedLinks.map(function (d) {
                window.graph.initState.links.map(function (a) {
                  if (a.id === d) {
                    d3.select("#link__" + a.id).style("stroke", c);
                    d3.select("#arrow-marker___" + a.id).style("stroke", c).style("fill", c);
                    a.stroke = c;
                  }
                });
              });
            }
            this.$t.val(c);
            this.$tb.css("background-color", c);
          }
        });
      })
      .on('contextmenu:blur', function (e) { });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.linkFillPicker = function (item, opt, root) {
    $('<p>Text colour    <input id="linkFillPicker" type="text" value="#ffffff" style="float:right;"></p>')
      .appendTo(this);
    this.addClass('labels')
      .on('contextmenu:focus', function (e) {
        var d = d3.select(opt.$trigger[0]).data()[0];
        $("#linkFillPicker").icolor({
          colors: window.graph.colors,
          col: window.graph.colorsColumn,
          autoClose: true,
          onSelect: function (c) {
            $('#linkFillPicker').css("background", c);
            if (window.graph.selectedLinks.length > 0) {
              window.graph.selectedLinks.map(function (d) {
                window.graph.initState.links.map(function (a) {
                  if (a.id === d) {
                    d3.select("#link-label__" + a.id).style("fill", c);
                    a.fill = c;
                  }
                });
              });
            }
            this.$t.val(c);
            this.$tb.css("background-color", c);
          }
        });
      })
      .on('contextmenu:blur', function (e) { });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.nodeColorPicker = function (item, opt, root) {
    $('<p>Colour <input id="nodeColorPicker" type="text" value="#ffffff" style="float:right;"></p>')
      .appendTo(this);
    this.addClass('labels')
      .on('contextmenu:focus', function (e) {
        $("#nodeColorPicker").icolor({
          colors: window.graph.colors,
          col: window.graph.colorsColumn,
          autoClose: true,
          onSelect: function (c) {
            $('#nodeColorPicker').css("background", c);
            var nodeData = d3.select(opt.$trigger[0]).data()[0];
            d3.select(opt.$trigger[0]).style("fill", c);
            window.graph.initState.nodes[nodeData.id].fill = c;
            if (window.graph.selectedNodes.length > 0) {
              window.graph.selectedNodes.map(function (d) {
                var node = d3.select("#node__" + d).select(".node");
                node.style("fill", c).style("stroke-width", (+node.style("stroke-width")) / 2);
                window.graph.initState.nodes[d].fill = c;
              });
            }
            this.$t.val(c);
            this.$tb.css("background-color", c);
          }
        });
      })
      .on('contextmenu:blur', function (e) { });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.nodeBorderColorPicker = function (item, opt, root) {
    $('<p>Border colour <input id="nodeBorderColorPicker" type="text" value="#000000" style="float:right;"></p>')
      .appendTo(this);
    this.addClass('labels')
      .on('contextmenu:focus', function (e) {
        $("#nodeBorderColorPicker").icolor({
          colors: window.graph.colors,
          col: window.graph.colorsColumn,
          autoClose: true,
          onSelect: function (c) {
            $('#nodeBorderColorPicker').css("background", c);
            var nodeData = d3.select(opt.$trigger[0]).data()[0];
            d3.select(opt.$trigger[0]).style("stroke", c);
            window.graph.initState.nodes[nodeData.id].stroke = c;
            if (window.graph.selectedNodes.length > 0) {
              window.graph.selectedNodes.map(function (d) {
                var node = d3.select("#node__" + d).select(".node");
                node.style("stroke", c).style("stroke-width", (+node.style("stroke-width")) / 2);
                window.graph.initState.nodes[d].stroke = c;
              });
            }
            this.$t.val(c);
            this.$tb.css("background-color", c);
          }
        });
      })
      .on('contextmenu:blur', function (e) { });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.nodeTextColorPicker = function (item, opt, root) {
    $('<p>Text colour <input id="nodeTextColorPicker" type="text" value="#ffffff" style="float:right;"></p>')
      .appendTo(this);
    this.addClass('labels')
      .on('contextmenu:focus', function (e) {
        $("#nodeTextColorPicker").icolor({
          colors: window.graph.colors,
          col: window.graph.colorsColumn,
          autoClose: true,
          onSelect: function (c) {
            $('#nodeTextColorPicker').css("background", c);
            var nodeData = d3.select(opt.$trigger[0]).data()[0];
            window.graph.initState.nodes[nodeData.id].textFill = c;
            if (window.graph.selectedNodes.length > 0) {
              window.graph.selectedNodes.map(function (d) {
                var node = d3.select("#node__" + d).select(".node-label");
                node.style("fill", c);
                window.graph.initState.nodes[d].textFill = c;
              });
            }
            this.$t.val(c);
            this.$tb.css("background-color", c);
          }
        });
      })
      .on('contextmenu:blur', function (e) { });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.groupColorPicker = function (item, opt, root) {
    $('<p>Colour <input id="groupColorPicker"type="text" value="#FFFFFF" style="float:right;"></p>')
      .appendTo(this);
    this.addClass('labels')
      .on('contextmenu:focus', function (e) {
        $("#groupColorPicker").icolor({
          colors: window.graph.colors,
          col: window.graph.colorsColumn,
          autoClose: true,
          onSelect: function (c) {
            $('#groupColorPicker').css("background", c);
            var groupData = d3.select(opt.$trigger[0]).data()[0];
            d3.select(opt.$trigger[0]).style("fill", c);
            window.graph.initState.nodes[groupData.id].fill = c;
            if (window.graph.selectedGroups.length > 0) {
              window.graph.selectedGroups.map(function (d) {
                var group = d3.select("#group__" + d).select(".group");
                group.style("fill", c).style("stroke-width", (+group.style("stroke-width")) / 2);
                window.graph.initState.nodes[d].fill = c;
              });
            }
            this.$t.val(c);
            this.$tb.css("background-color", c);
          }
        });
      })
      .on('contextmenu:blur', function (e) { });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.groupBorderColorPicker = function (item, opt, root) {
    $('<p>Border colour <input id="groupBorderColorPicker" type="text" value="#000000" style="float:right;"></p>')
      .appendTo(this);
    this.addClass('labels')
      .on('contextmenu:focus', function (e) {
        $("#groupBorderColorPicker").icolor({
          colors: window.graph.colors,
          col: window.graph.colorsColumn,
          autoClose: true,
          onSelect: function (c) {
            $('#groupBorderColorPicker').css("background", c);
            var groupData = d3.select(opt.$trigger[0]).data()[0];
            d3.select(opt.$trigger[0]).style("stroke", c);
            window.graph.initState.nodes[groupData.id].stroke = c;
            if (window.graph.selectedGroups.length > 0) {
              window.graph.selectedGroups.map(function (d) {
                var group = d3.select("#group__" + d).select(".group");
                group.style("stroke", c).style("stroke-width", (+group.style("stroke-width")) / 2);
                window.graph.initState.nodes[d].stroke = c;
              });
            }
            this.$t.val(c);
            this.$tb.css("background-color", c);
          }
        });
      })
      .on('contextmenu:blur', function (e) { });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.groupTextColorPicker = function (item, opt, root) {
    $('<p>Text colour <input id="groupTextColorPicker" type="text" value="#000000" style="float:right;"></p>')
      .appendTo(this);
    this.addClass('labels')
      .on('contextmenu:focus', function (e) {
        $("#groupTextColorPicker").icolor({
          colors: window.graph.colors,
          col: window.graph.colorsColumn,
          autoClose: true,
          onSelect: function (c) {
            $('#groupTextColorPicker').css("background", c);
            var groupData = d3.select(opt.$trigger[0]).data()[0];
            window.graph.initState.nodes[groupData.id].textFill = c;
            if (window.graph.selectedGroups.length > 0) {
              window.graph.selectedGroups.map(function (d) {
                var group = d3.select("#group__" + d).select(".group-label");
                group.style("fill", c);
                window.graph.initState.nodes[d].textFill = c;
              });
            }
            this.$t.val(c);
            this.$tb.css("background-color", c);
          }
        });
      })
      .on('contextmenu:blur', function (e) { });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.textAnchorGroup = function (item, opt, root) {
    $('<p><span style="margin-right:10px;">Text position</span> <i class="fa fa-align-left" style="margin-right:4px;"></i><i class="fa fa-align-justify" style="margin:0 4px;"></i><i class="fa fa-align-right" style="margin-left:4px;"></i></p>')
      .appendTo(this)
      .on('click', 'i', function () {
        var className = $(this).attr('class');
        var options = {
          1: 'start',
          2: 'middle',
          3: 'end'
        };
        var d = d3.select(opt.$trigger[0]).data()[0];
        var number = 0;
        if (className === "fa fa-align-left") {
          number = 1;
        } else if (className === "fa fa-align-justify") {
          number = 2;
        } else if (className === "fa fa-align-right") {
          number = 3;
        }
        graph.initState.nodes[d.id].textAnchor = options[number];
        if (graph.selectedGroups.length > 0) {
          graph.selectedGroups.map(function (d) {
            graph.initState.nodes[d].textAnchor = options[number];
          });
        }
        root.$menu.trigger('contextmenu:hide');
      });
    this.addClass('labels').on('contextmenu:focus', function (e) {
    }).on('contextmenu:blur', function (e) {
    }).on('keydown', function (e) {
    });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.textAnchorNode = function (item, opt, root) {
    $('<p><span style="margin-right:10px;">Text position</span> <i class="fa fa-align-left" style="margin-right:4px;"></i><i class="fa fa-align-justify" style="margin:0 4px;"></i><i class="fa fa-align-right" style="margin-left:4px;"></i></p>')
      .appendTo(this)
      .on('click', 'i', function () {
        var className = $(this).attr('class');
        var options = {
          1: 'start',
          2: 'middle',
          3: 'end'
        };
        var d = d3.select(opt.$trigger[0]).data()[0];
        var number = 0;
        if (className === "fa fa-align-left") {
          number = 1;
        } else if (className === "fa fa-align-justify") {
          number = 2;
        } else if (className === "fa fa-align-right") {
          number = 3;
        }
        graph.initState.nodes[d.id].textAnchor = options[number];
        if (graph.selectedNodes.length > 0) {
          graph.selectedNodes.map(function (d) {
            graph.initState.nodes[d].textAnchor = options[number];
          });
        }
        root.$menu.trigger('contextmenu:hide');
      });
    this.addClass('labels').on('contextmenu:focus', function (e) {
    }).on('contextmenu:blur', function (e) {
    }).on('keydown', function (e) {
    });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.textAnchorLink = function (item, opt, root) {
    $('<p><span style="margin-right:10px;">Text position</span> <i class="fa fa-align-left" style="margin-right:4px;"></i><i class="fa fa-align-justify" style="margin:0 4px;"></i><i class="fa fa-align-right" style="margin-left:4px;"></i></p>')
      .appendTo(this)
      .on('click', 'i', function () {
        var className = $(this).attr('class');
        var options = {
          1: 'start',
          2: 'middle',
          3: 'end'
        };
        var d = d3.select(opt.$trigger[0]).data()[0];
        var number = 0;
        if (className === "fa fa-align-left") {
          number = 1;
        } else if (className === "fa fa-align-justify") {
          number = 2;
        } else if (className === "fa fa-align-right") {
          number = 3;
        }
        if (graph.selectedLinks.length > 0) {
          graph.selectedLinks.map(function (d) {
            graph.initState.links.map(function (c) {
              if (c.id == d) {
                c.textAnchor = options[number];
              }
            });
          });
        }
        root.$menu.trigger('contextmenu:hide');
      });
    this.addClass('labels').on('contextmenu:focus', function (e) {
    }).on('contextmenu:blur', function (e) {
    }).on('keydown', function (e) {
    });
  };



  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.iconsLink = function (item, opt, root) {
    $('<div id="unicode-symbols-container" style="width: 300px; background: rgb(255, 255, 255);"><span class="foreign unicode-1" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💗</span><span class="foreign unicode-2" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💜</span><span class="foreign unicode-3" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💛</span><span class="foreign unicode-4" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💚</span><span class="foreign unicode-5" style="font-size: 14px; margin-right: 1px; cursor: pointer;">✔</span><span class="foreign unicode-6" style="font-size: 14px; margin-right: 1px; cursor: pointer;">✘</span><span class="foreign unicode-7" style="font-size: 14px; margin-right: 1px; cursor: pointer;">►</span><span class="foreign unicode-8" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▷</span><span class="foreign unicode-9" style="font-size: 14px; margin-right: 1px; cursor: pointer;">🙁</span><span class="foreign unicode-10" style="font-size: 14px; margin-right: 1px; cursor: pointer;">⭐</span><span class="foreign unicode-11" style="font-size: 14px; margin-right: 1px; cursor: pointer;">⚡</span><span class="foreign unicode-12" style="font-size: 14px; margin-right: 1px; cursor: pointer;">🙂</span><span class="foreign unicode-13" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▇</span><span class="foreign unicode-14" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▆</span><span class="foreign unicode-15" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▅</span><span class="foreign unicode-16" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▃</span><span class="foreign unicode-17" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▂</span></div>')
      .appendTo(this)
      .on('click', 'span', function () {
        var d = d3.select(opt.$trigger[0]).data()[0];
        var icon = $(this).text();
        var text = d3.select(".link-textarea-focus textarea").property("value") || "";
        text = text + icon;
        d3.select(".link-textarea-focus textarea").property("value", text);
        if (graph.selectedLinks.length > 0) {
          graph.selectedLinks.map(function (d) {
            graph.initState.links.map(function (c) {
              if (c.id == d) {
                c.name = text;
                d3.select("#link-label__" + c.id).text(c.name);
              }
            });
          });
        }
      });
    this.addClass('labels').on('contextmenu:focus', function (e) {
    }).on('contextmenu:blur', function (e) {
    }).on('keydown', function (e) {
    });
  };


  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.iconsNode = function (item, opt, root) {
    $('<div id="unicode-symbols-container" style="width: 300px; background: rgb(255, 255, 255);"><span class="foreign unicode-1" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💗</span><span class="foreign unicode-2" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💜</span><span class="foreign unicode-3" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💛</span><span class="foreign unicode-4" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💚</span><span class="foreign unicode-5" style="font-size: 14px; margin-right: 1px; cursor: pointer;">✔</span><span class="foreign unicode-6" style="font-size: 14px; margin-right: 1px; cursor: pointer;">✘</span><span class="foreign unicode-7" style="font-size: 14px; margin-right: 1px; cursor: pointer;">►</span><span class="foreign unicode-8" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▷</span><span class="foreign unicode-9" style="font-size: 14px; margin-right: 1px; cursor: pointer;">🙁</span><span class="foreign unicode-10" style="font-size: 14px; margin-right: 1px; cursor: pointer;">⭐</span><span class="foreign unicode-11" style="font-size: 14px; margin-right: 1px; cursor: pointer;">⚡</span><span class="foreign unicode-12" style="font-size: 14px; margin-right: 1px; cursor: pointer;">🙂</span><span class="foreign unicode-13" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▇</span><span class="foreign unicode-14" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▆</span><span class="foreign unicode-15" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▅</span><span class="foreign unicode-16" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▃</span><span class="foreign unicode-17" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▂</span></div>')
      .appendTo(this)
      .on('click', 'span', function () {
        var d = d3.select(opt.$trigger[0]).data()[0];
        var icon = $(this).text();
        // var text = graph.initState.nodes[d.id].name.replaceAll(' /// ', '\n');//
        var text = d3.select(".node-textarea-focus textarea").property("value").replaceAll('\n', ' /// ') || "";
        text = text + icon;
        graph.initState.nodes[d.id].name = text;
        text = text.replaceAll(' /// ', '\n');
        d3.select(".node-textarea-focus textarea").property("value", text);
        // d3.select("#node__" + d.id).select("text").text(text);
      });
    this.addClass('labels').on('contextmenu:focus', function (e) {
    }).on('contextmenu:blur', function (e) {
    }).on('keydown', function (e) {
    });
  };


  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.iconsGroup = function (item, opt, root) {
    $('<div id="unicode-symbols-container" style="width: 300px; background: rgb(255, 255, 255);"><span class="foreign unicode-1" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💗</span><span class="foreign unicode-2" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💜</span><span class="foreign unicode-3" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💛</span><span class="foreign unicode-4" style="font-size: 14px; margin-right: 1px; cursor: pointer;">💚</span><span class="foreign unicode-5" style="font-size: 14px; margin-right: 1px; cursor: pointer;">✔</span><span class="foreign unicode-6" style="font-size: 14px; margin-right: 1px; cursor: pointer;">✘</span><span class="foreign unicode-7" style="font-size: 14px; margin-right: 1px; cursor: pointer;">►</span><span class="foreign unicode-8" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▷</span><span class="foreign unicode-9" style="font-size: 14px; margin-right: 1px; cursor: pointer;">🙁</span><span class="foreign unicode-10" style="font-size: 14px; margin-right: 1px; cursor: pointer;">⭐</span><span class="foreign unicode-11" style="font-size: 14px; margin-right: 1px; cursor: pointer;">⚡</span><span class="foreign unicode-12" style="font-size: 14px; margin-right: 1px; cursor: pointer;">🙂</span><span class="foreign unicode-13" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▇</span><span class="foreign unicode-14" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▆</span><span class="foreign unicode-15" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▅</span><span class="foreign unicode-16" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▃</span><span class="foreign unicode-17" style="font-size: 14px; margin-right: 1px; cursor: pointer;">▂</span></div>')
      .appendTo(this)
      .on('click', 'span', function () {
        var d = d3.select(opt.$trigger[0]).data()[0];
        var icon = $(this).text();
        // var text = graph.initState.nodes[d.id].name.replaceAll(' /// ', '\n');
        var text = d3.select(".group-textarea-focus textarea").property("value").replaceAll('\n', ' /// ') || "";
        text = text + icon;
        graph.initState.nodes[d.id].name = text;
        text = text.replaceAll(' /// ', '\n');
        d3.select(".group-textarea-focus textarea").property("value", text);
        // d3.select("#group__" + d.id).select("text").text(text);
      });
    this.addClass('labels').on('contextmenu:focus', function (e) {
    }).on('contextmenu:blur', function (e) {
    }).on('keydown', function (e) {
    });
  };


  /**************************************************
   * Custom Command Handler
   **************************************************/
  $.contextMenu.types.contextMenuTitle = function (item, opt, root) {
    $('<p class="context-menu-title" style="width: 300px; background: #ffffff;text-align:center;">Selected 1 Element</p>')
      .appendTo(this)
      .on('click', 'span', function () {
        var d = d3.select(opt.$trigger[0]).data()[0];
        var text = d3.select(".link-textarea-focus textarea").property("value") || "";
        text = text + icon;
        d3.select(".link-textarea-focus textarea").property("value", text);
        if (graph.selectedLinks.length > 0) {
          graph.selectedLinks.map(function (d) {
            graph.initState.links.map(function (c) {
              if (c.id == d) {
                c.name = text;
                d3.select("#link-label__" + c.id).text(c.name);
              }
            });
          });
        }
      });
    this.addClass('labels').on('contextmenu:focus', function (e) {
    }).on('contextmenu:blur', function (e) {
    }).on('keydown', function (e) {
    });
  };
})($, d3, window);