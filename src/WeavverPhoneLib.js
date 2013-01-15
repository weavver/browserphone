if (typeof String.prototype.startsWith != 'function')
{
     // see below for better implementation!
     String.prototype.startsWith = function (str)
     {
          return this.indexOf(str) == 0;
     };
}

if (typeof String.prototype.endsWith != 'function')
{
     String.prototype.endsWith = function (suffix) {
          return this.indexOf(suffix, this.length - suffix.length) !== -1;
     };
}

// gets the base url path to where this script is hosted
function getBaseURL()
{
     var myScriptTag = $('script[src]').filter(function () {
          return (this.src.toLowerCase().endsWith('weavverphonelib.js') ||
                  this.src.toLowerCase().endsWith('weavverphone.js'));
     }).first();

     var scriptSRC = document.createElement('a');
     scriptSRC.href = myScriptTag.attr('src');
     //     scriptSRC.protocol; // => "http:"
     //     scriptSRC.hostname; // => "weavver.com"
     //     scriptSRC.port;     // => "3000"
     //     scriptSRC.pathname; // => "/path/"
     //     scriptSRC.search;   // => "?query=string"
     //     scriptSRC.hash;     // => "#hash"
     //     scriptSRC.host;     // => "weavver.com:8080"

     var path = scriptSRC.pathname;
     var endIndex = path.lastIndexOf("/");
     if (endIndex > 0) {
          path = path.substr(0, path.lastIndexOf("/") + 1);
          if (path.startsWith("/"))
               path = path.substr(1);
     }
     scriptSRC.path = path;

     return baseurl = scriptSRC.protocol + "//" + scriptSRC.host + "/" + path;
}

$(document).ready(function () {
     var baseURL = getBaseURL();
     $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', baseurl + 'jquery-ui-1.9.2.custom.min.css'));
     $('head').append($('<script type="text/javascript" />').attr('src', baseurl + 'swfobject.js'));
     
     $.get(baseurl + 'WeavverPhone.tpl.html', function (data) {
          var telphoneLinks = $('a[href^="tel:"], a[href^="sip:"]');
          telphoneLinks.each(function () {
               var elemId = $(this).attr("id");
               if (!elemId) {
                    elemId = getPseudoGuid();
                    $(this).attr("id", elemId);
               }
               var telURI = $(this).attr("href");
               $(this).data("teluri", telURI);
               $(this).attr("href", "javascript:showPhone('" + elemId + "')");

               $(this).append('<img id="' + elemId + '_phone" style="padding-left: 2px;" align="absmiddle" src="' + baseurl + '/images/Phone.png" height="35px" />');

               $(this).hover(
                                   function () {
                                        var id = $(this).attr("id");
                                        $("#" + id + "_phone").attr("src", baseurl + "/images/PhoneOver.png");
                                   },
                                   function () {
                                        var id = $(this).attr("id");
                                        $("#" + id + "_phone").attr("src", baseurl + "/images/Phone.png");
                                   }
                                   );
          }
          );

          $("body").append(data);

          $("#startcall").hide();
          $("#hangupcall").hide();
          $("#phonewidget").dialog({ autoOpen: false, title: 'Browser Phone', resizable: false });

          $("a", "#controls").button({ disabled: true });

          $("#phonewidget").dialog({
               beforeClose: function (event, ui)
               {
                    if ($("#phonewidget").data("flashLoaded") == "true")
                    {
                         hangupCall();
                    }
                    return true;
               }
          });
     });
});

$(window).resize(function() {
     $("#phonewidget").dialog("option", "position", "center");
});

function getPseudoGuid()
{
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
     {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
     });
}

function onInit()
{
     $("#flash").attr("visibility", "none");
     var mics = eval($("#flash")[0].micList());
     var sources = $("#input_source");
     var current_mic = $("#flash")[0].getMic();
     sources.children().remove();

     $("#status").text("Initializing...");

     for (i = 0; i < mics.length; i++)
     {
          var a = (i == current_mic) ? "selected" : "";
          sources.append("<option value='" + i + "' " + a + " >" + mics[i] + "</option");
     }
     
     $('#phonewidget').data("flashLoaded", "true");
}

function onConnected(sessionid)
{
     $("#status").text("Ready");
     $("#status").hide();
     $("#startcall").show();
}

function makeCall(number, account, options)
{
     if (!number)
          number = $("#startcall").data('telnum');
     $("#controls").show();
     $("#phonewidget").dialog("option", "position", "center");
     $("#flash")[0].makeCall(number, account, options);

     $("#phonewidget").data("state", "STARTINGCALL");
     $("#timer").data("time", 0);
     setTimeout('timerTick()', 1000);
}

function onDebug(output)
{
     $(document).append(output);
}

var params = {
     allowScriptAccess: 'always'
};

function showPhone(elemId)
{
     var baseurl = getBaseURL();
     if ($('#phonewidget').data("flashLoaded") != "false")
     {
          var swfURL = baseurl + "WeavverBrowserPhone.swf";
          if (typeof weavverPhoneOptions == 'undefined') {
               weavverPhoneOptions = {
                    rtmp_url: 'rtmp://205.134.225.23/phone'
               };
          }
          swfobject.embedSWF(swfURL, "flash", "10", "10", "9.0.0", "expressInstall.swf", weavverPhoneOptions, params, []);
          //$("#flash").hide();
     }
     $('#phonewidget').dialog('open');
     $("#timer").data("time", 0);
     $("#timer").html("");
     var telURI = $("#" + elemId).data('teluri');
     var telNum = (telURI.startsWith("sip:")) ? telURI : findBaseName(telURI);
     $("#startcall").data('telnum', telNum);

     var clonedData = $("#" + elemId).clone(false);
     clonedData.children("img").remove();

     var actionText = getParameterByName(telURI, "ActionText") || clonedData.html(); //$("#" + elemId).html();
     $("#startcall").html(actionText);
}

function onCallState(uuid, state)
{
     //$("#call_" + uuid).children('.call_state').text(state);
     if (state == "ACTIVE")
     {
          $("#startcall").hide();
          $("#phonewidget").data("uuid", uuid);
          $("#hangupcall").show();


          $("a", "#controls").button({ disabled: false });
     }

     $("#phonewidget").data("state", state);
}

function timerTick()
{
     var time1 = $("#timer").data("time");
     time1 = time1 + 1;
     $("#timer").data("time", time1);
     $("#timer").text(time1 + " second(s)");

     if ($("#phonewidget").data("state") != "HANGUP")
     {
          setTimeout('timerTick()', 1000);
     }
     else
     {
          $("#timer").data("time", 0);
     }
}

function onIncomingCall(uuid, name, number, account, evt)
{
     alert('incoming call');
     // if (name == "")
     // {
     //      name = "Unknown Name";
     // }
     // if (number == "")
     // {
     //      number = "Unknown Number";
     // }

     // $("#startcall").hide();
     // $("#phonewidget").data("uuid", uuid);
     // $("#hangupcall").show();

     // $("#incoming_name").text(name);
     // $("#incoming_number").text(number);
     // $("#incoming_account").text(account);
     // $("#incoming_call").dialog('open');
}

function sendDTMF(digit, duration) {
	$("#flash")[0].sendDTMF(digit, duration);
}

function hangupCall()
{
     $("#hangupcall").attr("disabled", "disabled");
     $("#flash")[0].hangup($("#phonewidget").data("uuid"));
}

function onHangup(uuid, cause)
{
     $("#phonewidget").data("uuid", null);
     $("#hangupcall").hide();
     $("#startcall").show();
     $("#controls").hide();
     $("#phonewidget").dialog("option", "position", "center");
}

function getParameterByName(telURI, name)
{
     name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
     var regexS = "[\\?&]" + name + "=([^&#]*)";
     var regex = new RegExp(regexS);
     var results = regex.exec(telURI);
     if (results == null)
          return null;
     else
          return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function findBaseName(url)
{
     url = url.replace("tel://", "");
     url = url.replace("tel:/", "");
     url = url.replace("tel:", "");
     
     var endIndex = url.indexOf("/");
     if (endIndex > 0)
          url = url.substring(0, endIndex);

     var endIndex2 = url.indexOf("?");
     if (endIndex2 > 0)
          url = url.substring(0, endIndex2);

     return url;
}