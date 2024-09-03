//Clear the content of Tabs
function setEmptyContentTabs() {
  $("#xml_edition").html("");
  $("#xcc-xml-header").html("");
  $("#xcc-xml-edit").html("");
  $("#nav-editnotes").html("");
  $("#nav-editapparatus").html("");
}

function setEmptyOneContentTab(tabName) {
  $(tabName).html("");
}

// The wrap function might be unrelated to the header issue, but keep it for completeness
const wrap = (s) => s.replace(
  /(?![^\n]{1,87}$)([^\n]{1,87})\s/g, '$1\n'
);

function loadNewNotesFormatInTab() {
  setEmptyOneContentTab("#nav-editnotes");
  let arrAllNotes = document.querySelectorAll("._note");
  var htmlAllNotes = "";
  for (var i = 0; i < arrAllNotes.length / 2; i++) {
    htmlAllNotes += arrAllNotes[i].getAttribute("n") + ". " + arrAllNotes[i].innerHTML + "<br><br>";
    arrAllNotes[i].innerHTML = "<span style='font-size:8pt;color:red'>(" + arrAllNotes[i].getAttribute("n") + ")</span>";
  }
  $("#nav-editnotes").html(htmlAllNotes);
}

function loadNewWitDetailFormatInTab() {
  let arrAllNotes = document.querySelectorAll("._witDetail");
  let htmlAllNotes = "";
  for (var i = 0; i < arrAllNotes.length; i++) {
    htmlAllNotes += arrAllNotes[i].getAttribute("n") + ". " + arrAllNotes[i].innerHTML + "<br><br>";
    arrAllNotes[i].setAttribute("data-note-text", arrAllNotes[i].innerHTML);
    arrAllNotes[i].innerHTML = "<span style='font-size:8pt;color:red'>[" + arrAllNotes[i].getAttribute("n") + "]</span>";
  }
}

// Load header functionality from the first JavaScript file
function getEditionTitle() {
  let editionTitle = document.querySelector("title");

  if (editionTitle) {
    $("#edition-title").html("<h3>" + editionTitle.innerHTML + "</h3>");
  } else {
    $("#edition-title").html("");
  }
}

function loadHeader() {
  const headerNode = document.getElementById("xcc-xml-header");
  var e = document.getElementById("xmldoc");
  var dateiName = e.options[e.selectedIndex].value;

  let xmltei = dateiName;
  let c = new CETEI();

  var lb_str = '<br>';

  let behaviors = {
    "tei": {
      // Load tei header
      "teiHeader": null,
      "head": function(e) {
        let level = document.evaluate("count(ancestor::tei-div)", e, null, XPathResult.NUMBER_TYPE, null);
        let result = document.createElement("h" + (level.numberValue > 7 ? 7 : level.numberValue));
        for (let n of Array.from(e.childNodes)) {
          result.appendChild(n.cloneNode());
        }
        return result;
      },
      "lb": [lb_str],
      "cb": [''],
      "pb": [''],
    }
  };

  c.addBehaviors(behaviors);
  if (xmltei != '') {
    c.getHTML5('xml/' + xmltei, function(data) {
      while (headerNode.firstChild) {
        headerNode.removeChild(headerNode.lastChild);
      }
      headerNode.appendChild(data);
    });
  } else {
    headerNode.firstChild.innerHtml = '';
  }

  // Hide the teiHeader
  setTimeout(function() {
    $("._text").hide();
  }, 100);

  setTimeout(function() {
    $("._teiHeader").show();
  }, 50);
}

function loadXmlAsText(showPart) {
  var show = showPart;
  var e = document.getElementById("xmldoc");
  var dateiName = e.options[e.selectedIndex].value;

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      if (show === 'edition') {
        getXmlText(this);
      } else if (show === 'header') {
        // No operation for header
      }
    }
  };
  xmlhttp.open("GET", "xml/" + dateiName, true);
  xmlhttp.send();
}

function getXmlText(xml) {
  var xmlDoc;
  xmlDoc = xml.responseText;

  const chars = xmlDoc.split('body>');
  let html = hljs.highlight(xmlDoc, { language: 'xml' }).value;
  document.getElementById("xcc-xml-edit").innerHTML = '<pre><code>' + html + "</code></pre>";
}

function loadFile() {
  setEmptyContentTabs();
  const editXmlNode = document.getElementById("xml_edition");
  var e = document.getElementById("xmldoc");
  var dateiName = e.options[e.selectedIndex].value;

  $("#edition-title").html("");

  let xmltei = dateiName;
  let c = new CETEI();
  let behaviors = {
    "tei": {
      "teiHeader": [''],
      "text": {
        "front": ['']
      },
      "head": function(e) {
        let level = document.evaluate("count(ancestor::tei-div)", e, null, XPathResult.NUMBER_TYPE, null);
        let result = document.createElement("h" + (level.numberValue > 7 ? 7 : level.numberValue));
        for (let n of Array.from(e.childNodes)) {
          result.appendChild(n.cloneNode());
        }
        return result;
      },
      "lb": ["<br>"],
      "pb": ["<p class=\"break\">$@n</p>"],
    }
  };
  c.addBehaviors(behaviors);
  if (xmltei != '') {
    c.getHTML5('xml/' + xmltei, function(data) {
      while (editXmlNode.firstChild) {
        editXmlNode.removeChild(editXmlNode.lastChild);
      }
      editXmlNode.appendChild(data);
      setTimeout(function() {
        let removeHead = document.querySelectorAll('front');
        removeHead.forEach(function(head) {
          head.parentNode.removeChild(head);
        });
      }, 100);

      getEditionTitle();
    });
  } else {
    editXmlNode.firstChild.innerHTML = '';
  }

  setTimeout(function() {
    if ($("#xcc_teiHeader").length) {
      $("#xcc_teiHeader").hide();
    }
  }, 50);

  setTimeout(function() {
    getEditionTitle();
    $(".lexedithtml tei-choice tei-sic").css("display", "none");
    let allWits = document.querySelectorAll("._witDetail");
    let tempWitValue;
    let tempTextWitDetail;

    for (var i = 0; i < allWits.length; i++) {
      tempWitValue = allWits[i].getAttribute("wit");
      tempWitValue = tempWitValue.replace(/#/gi, "");
      tempWitValue = tempWitValue.replace(/ /gi, "/");
      tempTextWitDetail = allWits[i].innerHTML;

      allWits[i].innerHTML = "<i> [" + tempWitValue + "]" + tempTextWitDetail + "</i>";
    }

    setEmptyOneContentTab("#nav-editnotes");
    loadNewNotesFormatInTab();
    loadNewWitDetailFormatInTab();

    showApparatusInTab();
    $("#nav-notes-tab").addClass("active hide");
    $("#nav-notes").addClass("active hide");
    $("._rdg").hide();
    $("._witDetail").hide();
  }, 10);

  setTimeout(function() {
    $("#xcc_text").show();
    $('#xcc_front').hide();
  }, 50);

  let arrAllEmptyLems = document.querySelectorAll("[data-lem-empty='1']");

  for (var i = 0; i < arrAllEmptyLems.length; i++) {
    arrAllEmptyLems[i].innerHTML = "∅";
  }

  setTimeout(function() {
    let arrAllTagsWithWit = document.querySelectorAll("tei-lem[data-lem-empty='1']");
    let tempWitValue;
    for (var i = 0; i < arrAllTagsWithWit.length; i++) {
      let html = arrAllTagsWithWit[i].innerHTML;

      tempWitValue = arrAllTagsWithWit[i].getAttribute("wit");
      tempWitValue = tempWitValue.replace(/#/gi, "");
      tempWitValue = tempWitValue.replace(/ /gi, "/");

      arrAllTagsWithWit[i].innerHTML = html + " <span class='xcc-wit-tag-lem' style='color:black;'>[<i>" + tempWitValue + "</i>]</span>";
    }
  }, 500);

  setTimeout(function() {
    let arrAllTagsWithWit = document.querySelectorAll("tei-lem");
    let tempWitValue;
    for (var i = 0; i < arrAllTagsWithWit.length; i++) {
      let html = arrAllTagsWithWit[i].innerHTML;

      tempWitValue = arrAllTagsWithWit[i].getAttribute("wit");
      tempWitValue = tempWitValue.replace(/#/gi, "");
      tempWitValue = tempWitValue.replace(/ /gi, "/");

      arrAllTagsWithWit[i].innerHTML = html + " <span class='xcc-wit-tag-lem' style='color:black;'>[<i>" + tempWitValue + "</i>]</span>";
    }
  }, 500);

  setTimeout(function() {
    let arrAllTagsWithWit = document.querySelectorAll("tei-rdg");
    let tempWitValue;
    for (var i = 0; i < arrAllTagsWithWit.length; i++) {
      let html = arrAllTagsWithWit[i].innerHTML;

      tempWitValue = arrAllTagsWithWit[i].getAttribute("wit");
      tempWitValue = tempWitValue.replace(/#/gi, "");
      tempWitValue = tempWitValue.replace(/ /gi, "/");

      arrAllTagsWithWit[i].innerHTML = html + " <span class='xcc-wit-tag-rdg' style='color:black;'>[<i>" + tempWitValue + "</i>]</span>";
    }
  }, 500);
}

function loadSic() {
  $("tei-sic").css("display", "inline");
}

function uncheckedBoxFunctions() {
  $("#lexshowcolors").prop("checked", false);
  $("#lexshowLemcolor").prop("checked", false);
  $("#lexshowRdgcolor").prop("checked", false);
  $("#lexshowSiccolor").prop("checked", false);
}

function checkedBoxFunctions() {
  $("#lexshowcolors").prop("checked", true);
  $("#lexshowLemcolor").prop("checked", true);
  $("#lexshowRdgcolor").prop("checked", true);
  $("#lexshowSiccolor").prop("checked", true);
}

function showAppFromRgd(active) {
  if (active === false) {
    $(".lexedithtml tei-app").css("background-color", "#FFFFFF");
    $(".lexedithtml tei-app").css("border", "solid 1px #FFFFFF");
    $(".lexedithtml tei-app").css("border-radius", "3px");
  } else {
    $(".lexedithtml tei-app").css("border", "solid 1px #0abab5");
    $(".lexedithtml tei-app").css("border-radius", "3px");
  }
}

function showWitTag(showWit, tagName) {
  if (showWit == true) {
    $("span.xcc-wit-tag-" + tagName).css("display", "inline");
  } else {
    $("span.xcc-wit-tag-" + tagName).css("display", "none");
  }
}

function showEmptyLemSymbolForRdg(showSysmbol) {
  let symbol = '';
  if (showSysmbol === true) {
    symbol = '∅';
  }
  let arrAllEmptyLems = document.querySelectorAll("[data-lem-empty='1']");
  for (var i = 0; i < arrAllEmptyLems.length; i++) {
    arrAllEmptyLems[i].innerHTML = symbol;
  }
}

function showApparatusInTab() {
  $("#nav-editapparatus").html("");

  let allRdgs;
  let rdgFromOutput = '';
  let tempWit;
  let linie = '';

  let container = document.querySelector('#xml_edition');
  allRdgs = container.querySelectorAll("#xcc_rdg");

  for (var i = 0; i < allRdgs.length; i++) {
    tempWit = '';
    tempWit = allRdgs[i].getAttribute("wit");

    if (i > 0) {
      linie = '<br><br>';
    }

    rdgFromOutput = rdgFromOutput + linie + "(*) " + tempWit + ": " + allRdgs[i].innerHTML;
  }

  $("#nav-editapparatus").html(rdgFromOutput);
}

function loadXmlAlmaFile() {
  setEmptyContentTabs();
  loadFile();
  setTimeout(loadSic(), 100);
}

$("document").ready(function () {
  function showEmptyLemSymbol(showSysmbol) {
    let symbol = ''
    if (showSysmbol === true) {
      symbol = '∅';
    } else {
      symbol = ''
    }
    let arrAllEmptyLems = document.querySelectorAll("[data-lem-empty='1']");

    for (var i = 0; i < arrAllEmptyLems.length; i++) {
      arrAllEmptyLems[i].innerHTML = symbol;
    }
  }

  $("info-box-right").scroll();

  $("#xedithtml").on("click", '._rdg', function () {
    let attributes = $(this).attr("wit") + "<br><br><b>'" + $(this).text() + "'</b>";
    $("#nav-infos").innerHtml = "";
    $("#nav-infos").html("<span style='text-align:center'>Element: <b>" + $(this).attr("data-origname") + "</b></span><br><br>" + attributes);
    $("#nav-notes-tab").removeClass("active");
    $("#nav-infos-tab").addClass("active");
    $("#nav-notes").removeClass("active hide");
    $("#nav-infos").addClass("active show");
  });

  $("#xedithtml").on("click", '._sic', function () {
    let attributes = $(this).attr("wit") + "<br><br><b>'" + $(this).text() + "'</b>";
    $("#nav-infos").innerHtml = "";
    $("#nav-infos").html("<span style='text-align:center'>Element: <b>" + $(this).attr("data-origname") + "</b></span><br><br>" + attributes);
    $("#nav-notes-tab").removeClass("active");
    $("#nav-infos-tab").addClass("active");
    $("#nav-notes").removeClass("active show");
    $("#nav-infos").addClass("active show");
  });

  $("#xedithtml").on("click", '._note', function () {
    $("#nav-infos-tab").removeClass("active");
    $("#nav-notes-tab").addClass("active show");
    $("#nav-infos").removeClass("active show");
    $("#nav-notes").addClass("active show");

    let noteText = $(this).data("noteText");
    let noteNum = $(this).attr("n");
    $("#nav-notes").html('(' + noteNum + "). " + noteText);
  });

  $("#xedithtml").on("click", '._witDetail', function () {
    $("#nav-infos-tab").removeClass("active");
    $("#nav-notes-tab").addClass("active show");
    $("#nav-infos").removeClass("active show");
    $("#nav-notes").addClass("active show");

    let witDetailText = $(this).attr("data-note-text");
    let witDetailNum = $(this).attr("n");
    $("#nav-notes").html('[' + witDetailNum + "]. " + witDetailText);
  });

  $("#lexshowrdg").on("change", $(this), function () {
    if ($("#lexshowrdg").prop("checked") === false) {
      $("._rdg").hide();
      showEmptyLemSymbol(false);
      showSiglen(false);
    } else {
      $("._rdg").show();
      showEmptyLemSymbol(true);
      showSiglen(true);
    }
  });

  $("#lexshowcolors").on("change", $(this), function () {
    if ($("#lexshowcolors").prop("checked") === true) {
      $(".lexedithtml tei-lem").css("color", "#1d7898");
      $(".lexedithtml tei-rdg").css("color", "#66b5d1");
      $(".lexedithtml tei-sic").css("color", "#be4d25");
      $("._rdg").show();

      checkedBoxFunctions();
    } else if ($("#lexshowcolors").prop("checked") === false) {
      $(".lexedithtml tei-lem").css("color", "black");
      $(".lexedithtml tei-rdg").css("color", "black");
      $(".lexedithtml tei-sic").css("color", "black");
      uncheckedBoxFunctions()
    }

  });

  $("#lexshowLemcolor").on("change", $(this), function () {
    if ($("#lexshowLemcolor").prop("checked") == false) {
      $(".lexedithtml tei-lem").css("color", "#000000");
      showEmptyLemSymbol(false);
      showWitTag(false, "lem");
    } else {
      $(".lexedithtml tei-lem").css("color", "#0072bb");
      showEmptyLemSymbol(true);
      showWitTag(true, "lem");

    }
  });

  $("#lexshowRdgcolor").on("change", $(this), function () {
    if ($("#lexshowRdgcolor").prop("checked") == false) {
      $(".lexedithtml tei-rdg").css("color", "#000000");
      $("._rdg").hide();
      $("._witDetail").css("display", "none");
      showWitTag(false, "rdg");

    } else {
      $(".lexedithtml tei-rdg").css("color", "#1D7898");
      $("._rdg").show();
      $("#xcc_rdgGrp").hide();
      $("._witDetail").css("display", "inline");
      showWitTag(true, "rdg");
    }
  });

  $("#lexshowSiccolor").on("change", $(this), function () {
    if ($("#lexshowSiccolor").prop("checked") === false) {
      $(".lexedithtml tei-choice tei-sic").css("color", "#000000");
      $(".lexedithtml tei-choice tei-sic").css("display", "none");
    } else {
      $(".lexedithtml tei-choice tei-sic").css("color", "#be4d25");
      $(".lexedithtml tei-choice tei-sic").css("display", "inline");
    }
  });

  $("#lexshowRdgGrpcolor").on("change", $(this), function () {
    if ($("#lexshowRdgGrpcolor").prop("checked") == false) {
      $("#xcc_rdgGrp").hide();
      showAppFromRgd(false);
      showEmptyLemSymbolForRdg(false);

    } else {
      $(".lexedithtml tei-rdggrp").css("border", "1px #565656");
      $(".lexedithtml tei-rdggrp").css("background-color", "#efefef");
      $("#xcc_rdgGrp").show();

      showAppFromRgd(true);
      showEmptyLemSymbolForRdg(true);
    }
  });

  $('#nav-viewer-tab').on("click", $(this), function () {
    $('#xcc-xml-header').css('display', 'none');
    $('#xml_edition').css('display', 'block');
    setTimeout(function () {
      $('#xcc_teiHeader').hide();
    }, 500)

    setTimeout(function () {
      $("#xcc_text").show();
      $('#xcc_front').hide();
    }, 50)
  });

  $('#nav-header-tab').on("click", $(this), function () {
    $('#xml_edition').css('display', 'none');
    $('#xcc-xml-header').css('display', 'block');
    getEditionTitle();
    setTimeout(function () {
      if ($("#xcc_text").length) {
        $("#xcc_text").hide();
        $("._text").hide();
      }
    }, 100)
    loadHeader();
  });

  $('#nav-xml-tab').on("click", $(this), function () {
    loadXmlAsText("edition");
  })

  $('#nav-editapparatus-tab').on("click", $(this), function () {
    $('#xml_edition').css('display', 'none');
    $('#xcc-xml-header').css('display', 'block');
    showApparatusInTab();
  })

  $('#nav-editnotes-tab').on("click", $(this), function () {
    $('#xml_edition').css('display', 'none');
    $('#xcc-xml-header').css('display', 'block');
    loadNewNotesFormatInTab();
  })
});
