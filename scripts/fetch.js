chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.updatePopup) {
    switch(message.update) {
      case "popup":
        $("#news").empty();
        $("#news").html(message.data.html);
        $("#news").append(message.data.append);
        if (message.data.tab == "adventurerslog") {
            ShowPlayerSearch();
        }
        else {
            $("#divplayername").hide();
            bindpostclick();
        }
        break;
      case "emptypopup":
        $("#news").empty();
        $("#news").html(message.data);
        ShowPlayerSearch();
    }
  }
});

function AdventurersLogTab() {
  var playername = $("#playername").val();
  var storedplayername = localStorage.playersearchname;
  if (playername == "" && (storedplayername !== "" && storedplayername !== undefined))
      playername = storedplayername;
  chrome.extension.sendMessage({ msg: "adventurerslog", playername: playername });
}
function NewsTab() {
  chrome.extension.sendMessage({ msg: "news" });
}

function open_item(url) {
	chrome.tabs.create({url: url});
	chrome.browserAction.setBadgeText({text:''});
}

function setactivetab(tab) {
    if (tab=="log") {
        $("#newstab").closest('li').removeClass('active');
        $("#adventlogtab").closest('li').addClass('active');
    }
    else {
        $("#adventlogtab").closest('li').removeClass('active');
        $("#newstab").closest('li').addClass('active');
    }
}

function bindpostclick() {
    $(".post").each(function(){
        var href = $(this).attr('data-click');
        $(this).bind('click',function(){
            open_item(href);
        });
    });
}

function ShowPlayerSearch() {
  $("#divplayername").show();
  $("#playername").select();
}

$(document).ready(function() {
    if (localStorage.playersearchname !== undefined && localStorage.playersearchname !== "") {
        $("#playername").val(localStorage.playersearchname);
    }
    $("#divplayername").hide();
    chrome.extension.sendMessage({ msg: "news" });

    $("#adventlogtab").bind("click",function() {
        var adventlogtabactive = $("#adventlogtab").closest('li').hasClass("active");
        if (!adventlogtabactive) {
            AdventurersLogTab();
            setactivetab("log");
        }
    });
    $("#newstab").bind("click",function() {
        var newstabactive = $("#newstab").closest('li').hasClass("active");
        if (!newstabactive) {
            NewsTab();
            setactivetab("news");
        }
    });
    $("#playername").keydown(function(e) {
        if (e.keyCode == 13) {
            localStorage.playersearchname = $("#playername").val();
            chrome.extension.sendMessage({ msg: "adventurerslog", playername: $("#playername").val() });
        }
    });
    $(".fa-search").bind("click",function() {
        localStorage.playersearchname = $("#playername").val();
        chrome.extension.sendMessage({ msg: "adventurerslog", playername: $("#playername").val() });
    });
});
