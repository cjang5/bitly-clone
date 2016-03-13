// Let's start up the Bitly Interview SDK
// I got 'myLogin' and 'myApiKey' from an external file
// called 'api_key_include.js'
const bitlySDK = new BitlySDK({
  login: myLogin,
  apiKey: myApiKey
});

// Check if sessionStorage is empty
var previousUrls = JSON.parse(sessionStorage.getItem('previousUrls'));

// We wrap these in document.ready so that appendBitlink
// is available to use
$(document).ready(function() {
  if (previousUrls) {
    // We will reload all the previous Bitlinks the user searched for
    // We will use $.Deferred to make sure they load in order
    // of creation
    var j = 0;
    var appending;    
    var temp = $.Deferred();
    var loadBitlink = function() {
      
      appending = $.Deferred();
      
      $.when(appending).done(function() {
        j++;
        
        if (j < previousUrls.length) {
          loadBitlink();
        }
        else {
          temp.resolve();
        }
      });
      
      appending.resolve(appendBitlink(previousUrls[j], true));
    }
    loadBitlink();
    
    $.when(temp).done(function() {
      var i = 1;
      var showBitlink = function() {
        
        setTimeout(function() {
          $("ul.bitlinks li:nth-child(" + i + ")").fadeIn(300);
          i++;

          if (i <= previousUrls.length) {
            showBitlink();
          }
        }, 250);
      }
      showBitlink();
    });
    
  }
  else {
    previousUrls = [];
  }
});

// Helper function to check if given string is has a protocol
var hasProtocol = function(url) {
  if (!url.match(/^[a-zA-Z]+:\/\//)) {
    return false;
  }
  
  // Otherwise, it's valid
  return true;
}

// Helper function to check if given string is a valid URL
var isValid = function(url) {
  if (!url.match(/^(([h|H][t|T][t|T][p|P]([s|S])?):\/\/)?([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/)) {
    return false;
  }
  
  // Otherwise, it's valid
  return true;
}

// The most recently created Bitlink
var mostRecentBitlink = null;

// The shorten button should instead copy the link in the bar
var shouldCopy = false;

// Helper function that shortens the given 'longUrl'
var shortenUrl = function(longUrl) {
  // Make sure longUrl has a protocol
  if (!hasProtocol(longUrl)) {
    longUrl = "http://" + longUrl;
  }

  var bitlink = null;
  bitlySDK.shorten(longUrl).then(function(result) {
    // Get the bitlink in the form we want it
    bitlink = "bit.ly/" + result.hash;

    // This Bitlink is now the most recently created one
    mostRecentBitlink = bitlink;

    // Change the text to the newly created Bitlink and highlight it
    $(".url-bar input").val(bitlink);
    $(".url-bar input").select();

    shouldCopy = true;
    $(".url-bar button").html("COPY");

    // append the bitlink
    appendBitlink(result.url);
    
    // Store this link for persistent storage
    previousUrls.push(result.url);
    sessionStorage.setItem('previousUrls', JSON.stringify(previousUrls));
  }, 
  function(error) {
    // Error handling
    // If the link submitted is already a Bitly link
    if (error == "Error: 500 ALREADY_A_BITLY_LINK") {
      if ($(".already-bitly").css("display") == "none") {
        $(".already-bitly").fadeIn(300).delay(1500).fadeOut(300);
      }
    }
  });
}

// Helper function that appends a new Bitlink item to the
// List of Bitlinks that have already been created
var appendBitlink = function(url, hide) {
  // Variables to hold what info we will need about the bitlink
  var shortUrl = url.substring(7);
  
  var getTitle = $.Deferred();
  bitlySDK.info(url).then(function(result) {
     getTitle.resolve(result.title);
  });
  
  
  var getLongUrl = $.Deferred();
  bitlySDK.expand(url).then(function(result) {
    var longUrl = result.long_url;

    // Trim the longUrl
    if (longUrl.indexOf("http://www.") > -1) {
      longUrl = longUrl.substring(11);
    }
    else if (longUrl.indexOf("https://www.") > -1) {
      longUrl = longUrl.substring(12);
    }
    else if (longUrl.indexOf("https://") > -1) {
      longUrl = longUrl.substring(8);
    }
    else {
      longUrl = longUrl.substring(7);
    }
    
    getLongUrl.resolve(longUrl);
  });
  
  var getClicks = $.Deferred();
  bitlySDK.clicks([url]).then(function(result) {
    getClicks.resolve(result[0].global_clicks);
  });
  
  $.when(getTitle, getLongUrl, getClicks)
    .done(function(title, longUrl, clicks) {
      if (title == null) {
        title = longUrl;
      }
    
      var html =  "<div class='bitlink-title'>" + 
                    "<a href='https://" + longUrl + "' target='_blank'>" + title + "</a>" +
                  "</div>" + 
                  "<div class='long-url'>" +
                    "<a href='" + longUrl + "'>" + longUrl + "</a>" + 
                  "</div>" + 
                  "<div class='bitlink-footer'>" + 
                    "<div class='short-url'>" + 
                      "<a>bit.ly/<span class='short-url-path'>" + shortUrl.substring(7) + "</span></a>" +
                    "</div>" + 
                    "<div class='hit-count'>" + 
                      "<a href='https://" + longUrl + "' target='_blank'>" +
                        "<span>" + clicks + "</span><img class='click-icon' src='assets/click-icon.svg'>" + 
                      "</a>" + 
                    "</div>" + 
                  "</div>" +
                  "<hr class='divider'>";

      if (hide) {
        $("ul.bitlinks").prepend(
          $("<li>").attr("class", "bitlink").attr("style", "display:none;").append(html).fadeOut(400));
      }
      else {
        $("ul.bitlinks").prepend(
          $("<li>").attr("class", "bitlink").attr("style", "display:none;").append(html).fadeIn(400));
      }
    });
}

// When the 'Shorten' button is clicked, shorten the URL
$(".url-bar button").on("click", function() {
  // Get text
  var longUrl = $(".url-bar input").val();
  
  // If the button is supposed to copy, do that instead
  // Otherwise, proceed normally
  if (shouldCopy) {   
    
    if ($(".copy-success").css("display") == "none") {
      $(".copy-success").fadeIn(300).delay(1500).fadeOut(300);
    }
    
    copyToClipboard(longUrl);
    return;
  }
  
  // Make sure it's valid
  if (isValid(longUrl)) {
    // Call the helper to shorten the Url
    shortenUrl(longUrl);
  }
  else if (longUrl == "") {
    if ($(".empty-url").css("display") == "none") {
      $(".empty-url").fadeIn(300).delay(1500).fadeOut(300);
    }
  }
  else {
    if ($(".shorten-failed").css("display") == "none") {
      $(".shorten-failed").fadeIn(300).delay(1500).fadeOut(300);
    }
  }
}); 

// When a longUrl is pasted into the url-bar,
// If it is valid, we automatically shorten it via shortenUrl()
// But if it's not, just leave it for the user to edit
$(".url-bar input").on("paste", function() {
  var longUrl = null;
  
  setTimeout(function() {
    longUrl = $(".url-bar input").val();
    
    // if URL is valid, we'll shorten it
    if (isValid(longUrl)) {
      // Call the helper to shorten the Url
      shortenUrl(longUrl);
    }
    else {
    }
  }, 4);
});

// Some handling for the url-bar, this is where we decide
// whether the url-bar button should COPY or SHORTEN the contents
// of the url-bar
$(".url-bar input").on("input", function() {
  // if the user clears the url-bar, 'mostRecentBitlink' is reset
  if ($(this).val() == "") {
    mostRecentBitlink = "";
    return;
  }
  
  // Otherwise, we check if the url-bar's content is
  // the mostRecentBitlink
  if ($(this).val() == mostRecentBitlink) {
    // Button should say copy
    shouldCopy = true;
    $(".url-bar button").html("COPY");
  }
  else {
    shouldCopy = false;
    $(".url-bar button").html("SHORTEN");
  }
});

// This handler behaves differently based on what key is pressed
// while the url-bar input form is focused
$(".url-bar input").keydown(function(e) {
  // If backspace is pressed and the contents of the form
  // are emptied, then we revert back to normal submit button status
  if (e.keyCode == 8) {
    setTimeout(function() {
      if ($(".url-bar input").val() == "") {
        $(".url-bar button").html("SHORTEN");
        shouldCopy = false;
      }
    }, 4);
  }
  
  // If enter/return is pressed, then we simulate
  // pressing the button
  if (e.keyCode == 13) {
    $(".url-bar button").click();
  }
});

// Helper function to copy given text to user's clipboard
var copyToClipboard = function(string) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(string).select();
  document.execCommand("copy");
  $temp.remove();
}

// When the user clicks on the orange Bitlink
// we will copy it to their clipboard instead of navigating to 
// the link
$("body").on("click", "ul li .short-url a", function() {
  var bitlink = "bit.ly/" + $(this).find("span").html();
  copyToClipboard(bitlink);
  if ($(".copy-success").css("display") == "none") {
    $(".copy-success").fadeIn(300).delay(1500).fadeOut(300);
  }
});
