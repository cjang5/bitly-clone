// Let's start up the Bitly Interview SDK
const bitlySDK = new BitlySDK({
  login: "jangerino",
  apiKey: "R_8abd1ae125c742aab9e5350d28fcc6a7"
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
//    console.log("Changing URL..."); //TEMP
    longUrl = "http://" + longUrl;
//    console.log("Fixed to: " + longUrl); // TEMP
  }

  var bitlink = null;

  bitlySDK.shorten(longUrl).then(function(result) {
    // Get the bitlink in the form we want it
    bitlink = "bit.ly/" + result.hash;

    // This Bitlink is now the most recently created one
    mostRecentBitlink = bitlink;

//    console.log(result);
//    console.log("Bitlink: " + bitlink);

    // Change the text to the newly created Bitlink and highlight it
    $(".url-bar input").val(bitlink);
    $(".url-bar input").select();

    shouldCopy = true;
    $(".url-bar button").html("COPY");
    
    // append the bitlink
    appendBitlink(result.url);
  });
}

// Helper function that appends a new Bitlink item to the
// List of Bitlinks that have already been created
var appendBitlink = function(url) {
  // Variables to hold what info we will need about the bitlink
  var shortUrl = url.substring(7);
//  console.log("SHORT URL: \"" + shortUrl + "\"");
  
  var title = null;
  bitlySDK.info(url).then(function(result) {
//    console.log(result);
    title = result.title;
  });
  
  var longUrl = null;
  bitlySDK.expand(url).then(function(result) {
    longUrl = result.long_url;
    
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
  });
  
  var hitCount = 0;
  bitlySDK.clicks([url]).then(function(result) {
//    console.log(result);
    hitCount = result[0].global_clicks;
  });
  
  setTimeout(function() {
//    console.log("FINAL");
//    console.log("Title: " + title);
//    console.log("Long URL: " + longUrl);
//    console.log("Short URL: " + shortUrl);
//    console.log("Clicks: " + hitCount);
    if (title == null)
      title = longUrl;
    
    var html =  "<div class='bitlink-title'>" + 
                  "<a href='" + longUrl + "'>" + title + "</a>" +
                "</div>" + 
                "<div class='long-url'>" +
                  "<a href='" + longUrl + "'>" + longUrl + "</a>" + 
                "</div>" + 
                "<div class='bitlink-footer'>" + 
                  "<div class='short-url'>" + 
                    "<a href=''>bit.ly/<span class='short-url-path'>" + shortUrl.substring(7) + "</span></a>" +
                  "</div>" + 
                  "<div class='hit-count'>" + 
                    "<a href=''>" +
                      "<span>" + hitCount + "</span><img class='click-icon' src='assets/click-icon.svg'>" + 
                    "</a>" + 
                  "</div>" + 
                "</div>";
            
    
    $("ul.bitlinks").prepend(
      $("<li>").attr("class", "bitlink").append(html));
  }, 150);
}

// When the 'Shorten' button is clicked, shorten the URL
$(".url-bar button").on("click", function() {
  // Get text
  var longUrl = $(".url-bar input").val();
  
  // If the button is supposed to copy, do that instead
  // Otherwise, proceed normally
  if (shouldCopy) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(longUrl).select();
    document.execCommand("copy");
    $temp.remove();
    return;
  }
  
  // Make sure it's valid
  if (isValid(longUrl)) {
    // Call the helper to shorten the Url
    shortenUrl(longUrl);
  }
  else {
//    console.log(longUrl + " is invalid!");
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
//      console.log(longUrl + " is valid!");
      
      // Call the helper to shorten the Url
      shortenUrl(longUrl);
    }
    else {
//      console.log(longUrl + " is invalid!");
    }
  }, 4);
});

$(".url-bar input").on("input", function() {
  // if the user clears the url-bar, 'mostRecentBitlink' is reset
  if ($(this).val() == "") {
    mostRecentBitlink = "";
    return;
  }
  
  // Otherwise, we check if the url-bar's content is
  // the mostRecentBitlink
  if ($(this).val() == mostRecentBitlink) {
//    console.log("Still there!");
    // Button should say copy
    shouldCopy = true;
    $(".url-bar button").html("COPY");
  }
  else {
//    console.log("SHORTEN" + mostRecentBitlink);
    shouldCopy = false;
    $(".url-bar button").html("SHORTEN");
  }
});

// This handler checks for when the url-bar is emptied
// whether it be by manual backspacing or by
// highlighting the contents and pressing backspace
// Probably not the most elegant way, but it works for now
$(".url-bar input").keydown(function(e) {
  if (e.keyCode == 8) {
    setTimeout(function() {
      if ($(".url-bar input").val() == "") {
        $(".url-bar button").html("SHORTEN");
        shouldCopy = false;
      }
    }, 4);
  }  
});