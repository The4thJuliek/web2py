//Clear the content of Tabs
function setEmptyContentTabs(){
    $("#xedithtml").html("");
    $("#xcc-xml-header").html("");
    $("#xcc-xml-edit").html("");
    $("#nav-editnotes").html("");
    $("#nav-editapparatus").html("");
}

function setEmptyOneContentTab(tabName){
    $(tabName).html("");
}


function loadFileAnShowOnlyHeader()
{
   //setEmptyTabs();
    //alert("22");
    getEditionTitle();
    const myNode = document.getElementById("xcc-xml-header");
    var e = document.getElementById("xmldoc");
    var value = e.value;
    var dateiName   = e.options[e.selectedIndex].value;
    //alert(dateiName);

    $("#edition-title").html("");

    let xmltei = dateiName;

    let c = new CETEI();
    let behaviors = {

        "tei": {
            "teiHeader":null,
            "head": function(e) {
              let level = document.evaluate("count(ancestor::tei-div)", e, null, XPathResult.NUMBER_TYPE, null);
              let result = document.createElement("h" + (level.numberValue>7 ? 7 : level.numberValue));
              for (let n of Array.from(e.childNodes)) {
                result.appendChild(n.cloneNode());
              }
              return result;
            },
            "lb": ["<br>"],
            /* Insert a <p> with the content of the <pb>'s @n attribute inside it
               Add a line above with CSS */
            "pb": ["<p class=\"break\">$@n</p>"],
      }
    };
    c.addBehaviors(behaviors);
    if( xmltei != '' ){
        c.getHTML5('xml/' + xmltei, function(data){
           // -- XCC comentat  myNode.firstChild.innerHtml = '';

            while (myNode.firstChild) {
                myNode.removeChild(myNode.lastChild);
            }

            document.getElementById('xcc-xml-header').appendChild(data);
        });
    }else{
        myNode.firstChild.innerHtml = '';
    }
}

const wrap = (s) => s.replace(
    /(?![^\n]{1,87}$)([^\n]{1,87})\s/g, '$1\n'
);

function loadNewNotesFormatInTab()
{
    setEmptyOneContentTab("#nav-editnotes");
    let arrAllNotes = document.querySelectorAll("._note");
    var htmlAllNotes = "";
    for (var i = 0; i < arrAllNotes.length / 2; i++) {
        htmlAllNotes += arrAllNotes[i].getAttribute("n") + ". " + arrAllNotes[i].innerHTML + "<br><br>";
        arrAllNotes[i].innerHTML = "<span style='font-size:8pt;color:red'>(" + arrAllNotes[i].getAttribute("n") + ")</span>";
    }
    $("#nav-editnotes").html(htmlAllNotes);
}

function loadNewWitDetailFormatInTab()
{
    let arrAllNotes = document.querySelectorAll("._witDetail");
    let htmlAllNotes = "";
    for (var i = 0; i < arrAllNotes.length; i++) {
        htmlAllNotes += arrAllNotes[i].getAttribute("n") + ". " + arrAllNotes[i].innerHTML + "<br><br>";
        arrAllNotes[i].setAttribute("data-note-text", arrAllNotes[i].innerHTML);
        arrAllNotes[i].innerHTML = "<span style='font-size:8pt;color:red'>[" + arrAllNotes[i].getAttribute("n") + "]</span>";
    }
}


//Select the xml title and display it
function getEditionTitle()
{
    let editionTitle = document.querySelector("title");

    if(editionTitle){
        $("#edition-title").html( "<h3>" + editionTitle.innerHTML + "</h3>" );
    } else {
        $("#edition-title").html("");
    }
}


function loadXmlAsText(showPart)
{
    var show = showPart;
    var e = document.getElementById("xmldoc");
    //var value = e.value;
    var dateiName   = e.options[e.selectedIndex].value;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if( show === 'edition' )
        {
            getXmlText(this);
        }else if( show === 'header')
        {
        }
      }
    };
    xmlhttp.open("GET", "xml/" + dateiName, true);
    xmlhttp.send();
}


function getXmlText(xml)
{
    var xmlDoc;
    xmlDoc = xml.responseText;

    const chars = xmlDoc.split('body>');
    html = hljs.highlight( xmlDoc, {language: 'xml'}).value
    document.getElementById("xcc-xml-edit").innerHTML = '<pre><code>' + html + "</code></pre>";
}


function loadFile()
{
    setEmptyContentTabs();
    //xml edit area
    const editXmlNode = document.getElementById("xedithtml");
    var e = document.getElementById("xmldoc");  //get the selector
    var dateiName   = e.options[e.selectedIndex].value;	 //get the selected xml file name

    $("#edition-title").html("");

    let xmltei = dateiName;

    let c = new CETEI();  //TEI parser
    let behaviors = {

        "tei": {
            "teiHeader": [''],
            "text" : {
                "front": ['']
            },
            "head": function(e) {
              let level = document.evaluate("count(ancestor::tei-div)", e, null, XPathResult.NUMBER_TYPE, null);
              let result = document.createElement("h" + (level.numberValue>7 ? 7 : level.numberValue));
              for (let n of Array.from(e.childNodes)) {
                result.appendChild(n.cloneNode());
              }
          return result;
              console.log(result);
        },
        "lb": ["<br>"],
        /* Insert a <p> with the content of the <pb>'s @n attribute inside it
           Add a line above with CSS */
        "pb": ["<p class=\"break\">$@n</p>"],
      }
    };
    c.addBehaviors(behaviors);
    if( xmltei != '' ){
        c.getHTML5('xml/' + xmltei, function(data){

            //remove the old xml content
            while (editXmlNode.firstChild) {
                editXmlNode.removeChild(editXmlNode.lastChild);
            }
            editXmlNode.appendChild(data);
            setTimeout(function (){
                removeHead = document.querySelectorAll('front')
                removeHead.forEach(function (head){
                head.parentNode.removeChild(head);
                });
            }, 100);

            getEditionTitle();
        });
    } else {
        editXmlNode.firstChild.innerHTML = '';
    }

        setTimeout(function() {
        if($("#xcc_teiHeader").length ){
            $("#xcc_teiHeader").hide();
            }
        }, 50)


    // loadNewNotesFormatInTab();
    // showApparatusInTab();
    setTimeout( function () {
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

        // loadNewWitDetailFormatInTab();
        showApparatusInTab();
        $("#nav-notes-tab").addClass("active hide");
        $("#nav-notes").addClass("active hide");
        $("._rdg").hide();
        $("._witDetail").hide();

    }, 10);

        setTimeout(function (){
        $("#xcc_text").show();
        $('#xcc_front').hide();
        }, 50)


    let arrAllEmptyLems = document.querySelectorAll("[data-lem-empty='1']");

    for (var i = 0; i < arrAllEmptyLems.length; i++) {
        arrAllEmptyLems[i].innerHTML = "∅";
    }

    setTimeout(function (){
        let arrAllTagsWithWit = document.querySelectorAll("tei-lem[data-lem-empty='1']");
        let tempWitValue;
        for (var i = 0; i < arrAllTagsWithWit.length; i++) {
            let html = arrAllTagsWithWit[i].innerHTML;

            tempWitValue = arrAllTagsWithWit[i].getAttribute("wit");
            tempWitValue = tempWitValue.replace( /#/gi, "" );
            tempWitValue = tempWitValue.replace( / /gi, "/" );

            arrAllTagsWithWit[i].innerHTML =  html + " <span class=" + 'xcc-wit-tag-lem'+ " style='color:black;'>[<i>" + tempWitValue + "</i>]</span>";
    }}, 500)

    setTimeout(function (){
        let arrAllTagsWithWit = document.querySelectorAll("tei-lem");
        let tempWitValue;
        for (var i = 0; i < arrAllTagsWithWit.length; i++) {
            let html = arrAllTagsWithWit[i].innerHTML;

            tempWitValue = arrAllTagsWithWit[i].getAttribute("wit");
            tempWitValue = tempWitValue.replace( /#/gi, "" );
            tempWitValue = tempWitValue.replace( / /gi, "/" );

            arrAllTagsWithWit[i].innerHTML =  html + " <span class=" + 'xcc-wit-tag-lem'+ " style='color:black;'>[<i>" + tempWitValue + "</i>]</span>";
    }
        }
        , 500)

    setTimeout(function (){
        let arrAllTagsWithWit = document.querySelectorAll("tei-rdg");
        let tempWitValue;
        for (var i = 0; i < arrAllTagsWithWit.length; i++) {
            let html = arrAllTagsWithWit[i].innerHTML;

            tempWitValue = arrAllTagsWithWit[i].getAttribute("wit");
            tempWitValue = tempWitValue.replace( /#/gi, "" );
            tempWitValue = tempWitValue.replace( / /gi, "/" );

            arrAllTagsWithWit[i].innerHTML =  html + " <span class=" + 'xcc-wit-tag-rdg'+ " style='color:black;'>[<i>" + tempWitValue + "</i>]</span>";
    }
        }
        , 500)

}

function loadSic (){
      // showEmptyLemSymbolForRdg(true);
    $("tei-sic").css("display", "inline");
    // $(".lexedithtml tei-choice tei-sic").;
}

function uncheckedBoxFunctions()
{
    $("#lexshowcolors").prop( "checked", false );
    $("#lexshowLemcolor").prop( "checked", false );
    $("#lexshowRdgcolor").prop( "checked", false );
    $("#lexshowSiccolor").prop( "checked", false );
}

function checkedBoxFunctions()
{
    $("#lexshowcolors").prop( "checked", true );
    $("#lexshowLemcolor").prop( "checked", true );
    $("#lexshowRdgcolor").prop( "checked", true );
    $("#lexshowSiccolor").prop( "checked", true );
}



function showAppFromRgd( active ){
    if( active === false  ){
        $(".lexedithtml tei-app").css("background-color", "#FFFFFF");
        $(".lexedithtml tei-app").css("border", "solid 1px #FFFFFF");
        $(".lexedithtml tei-app").css("border-radius", "3px");
        //$(".lexedithtml tei-app").css("border-right", "solid 1px #FFFFFF");
        //$(".lexedithtml tei-app").css("border-left", "dotted 2px #FFFFFF");
    }else{
        $(".lexedithtml tei-app").css("border", "solid 1px #0abab5");
        $(".lexedithtml tei-app").css("border-radius", "3px");
    }
}

//--------------------------------------
//--- Show witness tag name
//------------------------------------

function showWitTag(showWit, tagName)
{
    // let arrAllTagsWithWit = document.querySelectorAll("._" + tagName + "[wit]");
    //     let tempWitValue;
        if( showWit == true){
            // for (var i = 0; i < arrAllTagsWithWit.length; i++) {
            //     let html = arrAllTagsWithWit[i].innerHTML;
            //
            //     //--- Wit-Value formatieren
            //     tempWitValue = arrAllTagsWithWit[i].getAttribute("wit");
            //     tempWitValue = tempWitValue.replace( /#/gi, "" );
            //     tempWitValue = tempWitValue.replace( / /gi, "/" );
            //
            // 	arrAllTagsWithWit[i].innerHTML =  html + " <span class=" + 'xcc-wit-tag-'+tagName+ " style='color:black;'>[<i>" + tempWitValue + "</i>]</span>";
            // 	// arrAllTagsWithWit[i].setAttribute("data-with-wit", html + " <span class=" + 'xcc-wit-tag-'+tagName+ " style='color:black;'>[<i>" + tempWitValue + "</i>]</span>");
            // }
            $("span.xcc-wit-tag-"+tagName).css("display", "inline");
        } else {
           $("span.xcc-wit-tag-"+tagName).css("display", "none");
        }
}
//--------------------------------------
//--- END Show Siglen
//------------------------------------

//----------------------------------------
//--- Show empty symbol for empty LEM
//----------------------------------------
function showEmptyLemSymbolForRdg( showSysmbol )
{
    let symbol = '';

    if( showSysmbol === true ){
        symbol = '∅';
    }

    let arrAllEmptyLems = document.querySelectorAll("[data-lem-empty='1']");

    for (var i = 0; i < arrAllEmptyLems.length; i++) {
        arrAllEmptyLems[i].innerHTML = symbol;
    }
}
//----------------------------------------
//--- END Show empty symbol for empty LEM
//----------------------------------------


//--------------------------------------------
//--- Show Apparatus
//---
//--- zeigt alle rdf und rdgGrp in extra Tab
//--------------------------------------------
function showApparatusInTab()
{
    $("#nav-editapparatus").html("");

    let allRdgs;
    let rdgFromOutput = '';
    let tempWit;
    let linie = '';

    let container = document.querySelector( '#xedithtml' );
    allRdgs = container.querySelectorAll( "#xcc_rdg" );

    for (var i = 0; i < allRdgs.length; i++) {
        tempWit = '';
        tempWit = allRdgs[i].getAttribute("wit");

        if( i > 0 ){
            linie = '<br><br>';
        }


        rdgFromOutput = rdgFromOutput + linie + "(*) "+ tempWit + ": " + allRdgs[i].innerHTML;
    }

    $("#nav-editapparatus").html( rdgFromOutput );
}
//----------------------------------------
//--- ENDE Show Apparatus
//----------------------------------------




/* -----------------------      MAIN    ------------------------------ */
function loadXmlAlmaFile()
{
    // setEmptyOneContentTab( "#nav-editnotes" );
    // setEmptyOneContentTab( "#nav-editapparatus" );
    setEmptyContentTabs();
    // showEmptyLemSymbolForRdg(true);
    loadFile();
    setTimeout(loadSic(), 100);

    // uncheckedBoxFunctions();

    //load xml file to xml block
    // loadXmlAsText( "edition" );
    // loadFileAnShowOnlyHeader();

}
/* ------------------------------------------------------------------- */


/* -----------------------      JQuery Events ------------------------ */

/* ------------------------------------------------------------------- */
$("document").ready(function () {

    // $("#xcc_teiHeader").hide();

    //----------------------------------------
    //--- Show empty symbol for empty LEM
    //----------------------------------------
    function showEmptyLemSymbol( showSysmbol )
    {
        let symbol = ''
        if( showSysmbol === true ){
            symbol = '∅';
        } else {
            symbol = ''
        }

        let arrAllEmptyLems = document.querySelectorAll("[data-lem-empty='1']");

        for (var i = 0; i < arrAllEmptyLems.length; i++) {
            arrAllEmptyLems[i].innerHTML = symbol;
          }
    }
    //----------------------------------------
    //--- END Show empty symbol for empty LEM
    //-----------------------------------------------

		$("info-box-right").scroll();

        //--------------------------------------
        //--- Show infos from RDG
        //------------------------------------
		$("#xedithtml").on("click", '._rdg', function(){
			//console.log( $(this).attr("data-origname") );
			//console.log( $(this).attr("wit") );
			let attributes = $(this).attr("wit") + "<br><br><b>'" + $(this).text() + "'</b>";
			$("#nav-infos").innerHtml = "";
			$("#nav-infos").html(  "<span style='text-align:center'>Element: <b>" + $(this).attr("data-origname")  + "</b></span><br><br>" + attributes );
            $("#nav-notes-tab").removeClass("active");
            $("#nav-infos-tab").addClass("active");
            $("#nav-notes").removeClass("active hide");
            $("#nav-infos").addClass("active show");
		});
        //--------------------------------------
        //--- Show infos from RDG
        //------------------------------------

        //------------------------------
        //--- Show SIC-element
        //------------------------------
		$("#xedithtml").on("click", '._sic', function(){
			let attributes = $(this).attr("wit") + "<br><br><b>'" + $(this).text() + "'</b>";
			$("#nav-infos").innerHtml = "";
			$("#nav-infos").html(  "<span style='text-align:center'>Element: <b>" + $(this).attr("data-origname")  + "</b></span><br><br>" + attributes );
            $("#nav-notes-tab").removeClass("active");
            $("#nav-infos-tab").addClass("active");
            $("#nav-notes").removeClass("active show");
            $("#nav-infos").addClass("active show");
		});
        //------------------------------
        //--- END Show SIC-element
        //------------------------------


        //----------------------------------------
        //--- Show notes from note in text
        //--- 18.3.2022 change witDetail to note
        //----------------------------------------
        $("#xedithtml").on("click", '._note', function(){
            $("#nav-infos-tab").removeClass("active");
            $("#nav-notes-tab").addClass("active show");
            $("#nav-infos").removeClass("active show");
            $("#nav-notes").addClass("active show");

            let noteText = $(this).data("note");
            let noteNum = $(this).attr("n");
            $("#nav-notes").html('('+noteNum + "). " + noteText);
        });


        $("#xedithtml").on("click", '._witDetail', function(){
            $("#nav-infos-tab").removeClass("active");
            $("#nav-notes-tab").addClass("active show");
            $("#nav-infos").removeClass("active show");
            $("#nav-notes").addClass("active show");

            let witDetailText = $(this).data("note");
            let witDetailNum = $(this).attr("n");
            $("#nav-notes").html('['+witDetailNum + "]. " + witDetailText);
        });
        //----------------------------------------
        //--- END Show notes from note in text
        //----------------------------------------

        //------------------------------
        //--- Show RDG-Block
        //------------------------------
		$("#lexshowrdg").on("change", $(this), function(){
			if( $("#lexshowrdg").prop("checked") === false ){
				$("._rdg").hide();
                showEmptyLemSymbol( false );
                showSiglen(false);
			}else{
				$("._rdg").show();
                showEmptyLemSymbol( true );
                showSiglen(true);
			}
		});
        //------------------------------
        //--- END Show RDG-Block
        //------------------------------

        //------------------------------
        //--- Show all colors
        //------------------------------
		$("#lexshowcolors").on("change", $(this), function(){
            if( $("#lexshowcolors").prop("checked") === true ){
				$(".lexedithtml tei-lem").css("color", "#1d7898");
				$(".lexedithtml tei-rdg").css("color", "#66b5d1");
				$(".lexedithtml tei-sic").css("color", "#be4d25");
				$("._rdg").show();

                checkedBoxFunctions();
            }else if( $("#lexshowcolors").prop("checked") === false ){
				$(".lexedithtml tei-lem").css("color", "black");
				$(".lexedithtml tei-rdg").css("color", "black");
				$(".lexedithtml tei-sic").css("color", "black");
                //--- alle checkbox als nicht ausgewählt setzen
                //--- und status auf 1 setzen
                uncheckedBoxFunctions()
            }

		});
        //------------------------------
        //--- END Show all colors
        //------------------------------

        //------------------------------
        //--- Show LEM colors
        //------------------------------
        $("#lexshowLemcolor").on( "change", $(this), function (){
            if( $("#lexshowLemcolor").prop("checked") == false ){
                $(".lexedithtml tei-lem").css("color", "#000000");
                showEmptyLemSymbol( false );
                showWitTag(false, "lem");
            }else{
                $(".lexedithtml tei-lem").css("color", "#0072bb");
                showEmptyLemSymbol( true);
                showWitTag(true, "lem");

            }
        });
        //------------------------------
        //--- END Show LEM colors
        //------------------------------

        //------------------------------
        //--- Show RDG colors
        //------------------------------
        $("#lexshowRdgcolor").on( "change", $(this), function (){
            if( $("#lexshowRdgcolor").prop("checked") == false ){
                //showRdg(false);
                $(".lexedithtml tei-rdg").css("color", "#000000");
                $("._rdg").hide();
                $("._witDetail").css("display", "none");
                showWitTag(false, "rdg");

            }else{
                //showRdg(true);
                $(".lexedithtml tei-rdg").css("color", "#1D7898");
                $("._rdg").show();
                $("#xcc_rdgGrp").hide();
                $("._witDetail").css("display", "inline");
                showWitTag(true, "rdg");
            }
        });
        //------------------------------
        //--- END Show RDG colors
        //------------------------------

        //------------------------------
        //--- Show SIC colors
        //------------------------------
        $("#lexshowSiccolor").on( "change", $(this), function (){
            if( $("#lexshowSiccolor").prop("checked") === false  ){
                $(".lexedithtml tei-choice tei-sic").css("color", "#000000");
                $(".lexedithtml tei-choice tei-sic").css("display", "none");
            }else{
                $(".lexedithtml tei-choice tei-sic").css("color", "#be4d25");
                $(".lexedithtml tei-choice tei-sic").css("display", "inline");
            }
        });

        //-----------------------------------------
        //--- Show rdg-Group color-background
        //-----------------------------------------
        $("#lexshowRdgGrpcolor").on( "change", $(this), function (){
            if( $("#lexshowRdgGrpcolor").prop("checked") == false ){
                // $(".lexedithtml tei-rdggrp").css("background-color", "#FFFFFF");
                // $(".lexedithtml tei-rdggrp").css("border-width", "0");
                // $(".lexedithtml tei-rdggrp").css("border-style", "none");
                $("#xcc_rdgGrp").hide();
                showAppFromRgd( false );
                showEmptyLemSymbolForRdg(false);

            }else{
                /*$(".lexedithtml tei-rdggrp").css("background-color", "#CCCCCC");*/
                /*$(".lexedithtml tei-rdggrp").css("border-right", "solid 3px blue");
                $(".lexedithtml tei-rdggrp").css("border-left", "solid 3px blue");*/
                $(".lexedithtml tei-rdggrp").css("border", "1px #565656");
                $(".lexedithtml tei-rdggrp").css("background-color", "#efefef");
                $("#xcc_rdgGrp").show();


                //--- include APP und RDG-Block
                showAppFromRgd( true );
                showEmptyLemSymbolForRdg(true);
            }
        });
        //-----------------------------------------
        //--- END Show rdg-Group color-background
        //-----------------------------------------

        $('#nav-viewer-tab').on( "click", $(this), function(){
            // $('#xcc-xml-header').css( 'display', 'none' );
            $('#xedithtml').css( 'display', 'block' );
            setTimeout(function (){
                $('#xcc_teiHeader').hide();
            }, 500)

            setTimeout(function (){
                $("#xcc_text").show();
                $('#xcc_front').hide();
            }, 50)


        });

        $('#nav-header-tab').on( "click", $(this), function(){
            $('#xedithtml').css( 'display', 'none' );
            $('#xcc-xml-header').css( 'display', 'block' );
            getEditionTitle();
             setTimeout(
                function()
                {
                    if( $("#xcc_text").length ){
                        $("#xcc_text").hide();
                        $("._text").hide();
                    }else{
                    }
                }, 100)
        });

        $('#nav-xml-tab').on("click", $(this), function (){
            loadXmlAsText("edition");
        })

 	});