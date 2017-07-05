var lastresponse = '';
var lastitemscount = 0;

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.msg == "news") {
            lastitemscount=0;
            fetch_feed('http://services.runescape.com/m=news/latest_news.rss',function(response) {
                display_stories(response,"news");
                lastreponse = response;
            });
        }
        if(request.msg == "adventurerslog") {
            lastitemscount=0;
            localStorage.setItem('playersearchname',request.playername);
            fetch_feed('http://services.runescape.com/m=adventurers-log/c=tB0ermS1flc/rssfeed?searchName='+request.playername,function(response) {
                display_stories(response,"adventurerslog");
                lastreponse = response;
            });
        }
    }
);

function fetch_feed(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(data) {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status == 304) {
          var data = xhr.responseText;
          callback(data);
        } else {
          chrome.runtime.sendMessage({updatePopup: true, update: "emptypopup", data: "<span id='playernotfound' class='playernotfound'>Player not found or private account.</span>"});
        }
      }
    }

    xhr.open('GET', url, true);
    xhr.send();
}


function display_stories(feed_data,feed) {
  var xml_doc = $.parseXML(feed_data);
  $xml = $(xml_doc);

  var popup = new Object();
  var items = $xml.find("item");
  var item = '';
  items.each(function(index, element) {
    var post = parse_post(element,feed);
    var class2 = '';
    if (index >= localStorage['unread_count']) {
      item += '<div class="post read" data-click="'+post.url+'">';
    }
    else {
      item += '<div class="post" data-click="'+post.url+'">';
    }
    item += '<span class="tag">' + post.tag + '</span>\
          <a href="' + post.url + '">\
            <div id="' + post.id + '" class="item'+feed+'">';
    if (feed!="adventurerslog") {
        item+= '<img src="' + post.img + '" width="107" height="60" />';
    }
    item +=  '<h4 class="h4'+feed+'">' + post.title + '</h4>\
              <span class="description description'+feed+'">' + post.description + '</span>\
            </div>\
          </a>';
    item += '</div>';

  });
  if ((items.length !== lastitemscount) && (lastitemscount !==0)) {
      //notifyMe();
  }
  lastitemscount = items.length;
  popup.append = item;
  popup.tab = feed;
  chrome.runtime.sendMessage({updatePopup: true, update: "popup", data: popup});
}

function open_item(url) {
	chrome.tabs.create({url: url});
	chrome.browserAction.setBadgeText({text:''});
}

function parse_post(element,feed) {
    var $element = $(element);
	var post = new Object();
	post.title = $element.find("title").text();

    if (feed=="news") {
        post.categories = [];
        var categories = $element.find("category");
        for (var i = 0; i < categories.length; i++) {
            post.categories.push(categories[i].innerHTML);
            post.tag = post.categories.join(', ');
            post.id = $(element).find("guid").text();
            post.url = $(element).find('link').text();
            post.description = $("<div/>").html($(element).find("description")).text();
            post.img = $(element).find("enclosure").attr('url') == undefined ? "" : $(element).find("enclosure").attr('url') ;
            var shorten = 120;
            if (post.title.length > 80) {
                shorten = 70;
            }
            post.description = post.description.substr(0, shorten);
            return post;
        }
    }

    if (feed=="adventurerslog") {
        post.categories = [];
        post.tag = "";
        post.id = $(element).find("guid").text();
        post.url = $(element).find('link').text();
        post.description = $("<div/>").html($(element).find("description")).text();

        return post;
    }

}

function onRequest(request, sender, callback) {
  if (request.action == 'fetch_feed') {
        fetch_feed(request.url, callback);
      }
}
