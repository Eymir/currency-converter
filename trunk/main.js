/*
Copyright (C) 2007 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// ---------------------- Global variables/objects ------------------------

// EntryList object.
// Manages the UI:
//  - The frame
//  - The content
//  - Adding entry items to the list
//  - Scrolling
//CBB8DE

//705082
var entryList;

// Entries received from the feed.
var lastEntries;

// The theme file that contains the CSS for the details view.
var DETAILS_CSS_FILE = 'details.css';

// The CSS styles to use in the details view.
var detailsCss;

// The current entry displayed in the details view.
var currentEntry = null;

var country_array; 

var country_array = new Array(50);
//country_array[0]="40";
//country_array[1]="1";

function button1_onclick() {
//view.alert("Combo 1 : "+combobox1.selectedIndex);
//view.alert("Combo 2 : "+combobox2.selectedIndex);
//removeElement(combobox2);   It'll remove Element & removeAllElements clears all element in form
//view.alert(edit1.value);
if(isNaN(edit1.value))
{
view.alert("Please Enter Digit");
return false;
}
if(combobox1.selectedIndex==combobox2.selectedIndex)
{
view.alert("You Can't Select Same currency");
return false;
}
else
{
var current_val = edit1.value;
var conversion = (country_array[combobox2.selectedIndex]/country_array[combobox1.selectedIndex]);
var converted_cur = (conversion * current_val);
label1.innerText = current_val +" "+ combobox1.selectedItem.name +" = "+converted_cur +" "+ combobox2.selectedItem.name;
}


//view.alert(country_array[combobox1.selectedIndex]);


//view.alert(converted_cur);
}


function combobox1_onclick() {
//view.alert(combobox1.selectedIndex);
}



// ---------------------- Gadget events ------------------------

function onOpen() {
  // Read in the details view CSS.
  detailsCss = gadget.storage.openText(
      pathify(CONFIG_THEME_DIR, DETAILS_CSS_FILE));

  // Create the EntryList.
  entryList = new EntryList(container, CONFIG_THEME_DIR);

  // Call draw with no data to display default error message.
  draw(null);

  // Refresh (request feed and then re-draw).
  refresh();
  // Run-forever timer that refreshes the feed.
  view.setInterval(refresh, CONFIG_REFRESH_FEED_MS);
}

// Entry item onclick handler.
function itemOnClick(entry) {
  debug.trace('Entry item onclick event.');

  // Is a details view already open?
  if (currentEntry !== null) {
    var previousEntry = currentEntry;

    // We explicitly close so we know for sure that "currentEntry" is
    // null at this point.
    pluginHelper.closeDetailsView();

    // Same entry as before, no need to open it again.
    if (previousEntry == entry) {
      return;
    }
  }

  currentEntry = entry;

  var htmlDetailsView = new DetailsView();
  htmlDetailsView.html_content = true;

  var htmlContent = '<style type="text/css">' + detailsCss + '</style>';
  htmlContent += entry.content;

  htmlDetailsView.setContent('', undefined, htmlContent, false, 0);

  // Show the details view
  pluginHelper.showDetailsView(htmlDetailsView,
      entry.title,
      gddDetailsViewFlagToolbarOpen,
      function(flags) { detailsViewOnFeedback(flags, entry.link); });
}

function openEntryInBrowser(url) {
  var winShell = new ActiveXObject('Shell.Application');
  winShell.ShellExecute(url);
}

// Handles when details view is closed.
// Here we want to open a link to the entry if the title bar is clicked.
function detailsViewOnFeedback(flags, url) {
  currentEntry = null;

  debug.trace('detailsViewOnFeedback event.');

  // User clicked on the title bar link.
  if (flags == gddDetailsViewFlagToolbarOpen) {
    openEntryInBrowser(url);
  }
}

function onSize() {
  entryList.resize(view.width, view.height);
}


// ---------------------- Feed retrieval and parsing ------------------------

function refresh() {
  debug.trace('Refreshing feed.');
  retrieveFeed(CONFIG_FEED_URL, draw);
}

// Requests a feed and executes 'callback' when finished.
function retrieveFeed(url, callback) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = onReadyStateChange;

  if (CONFIG_CACHE_BUSTER) {
    url += '?cache_buster_xyz=' + Math.random();
  }

  debug.trace('Opening request to: ' + url);

  function onRequestError() {
    request.abort();
    debug.warning('Request error, will retry later.');
    // Retry again later.
    view.setTimeout(refresh, getRetryDelay());
  }

  try {
    request.open('GET', url, true);
    request.send();
  } catch(e) {
    debug.warn('Could not retrieve feed: ' + e.message);

    // If there are no entries, we want to call the retry function.
    if (!lastEntries) {
      onRequestError();
    }
    return;
  }

  var timeoutTimer = null;

  if (!lastEntries) {
    // Want to set a timeout since no data is available.
    // If request timesout, call onRequestError to retry.
    timeoutTimer = view.setTimeout(
        onRequestError,
        CONFIG_HTTP_REQUEST_TIMEOUT_MS);
  }

  function onReadyStateChange() {
    if (request.readyState != 4) {
      return;
    }

    if (request.status == 200) {
      if (timeoutTimer) {
        debug.trace('Cancelling request timeout timer.');
        view.clearTimeout(timeoutTimer);
      }

      debug.trace('Retrieve succeeded.');
			
	  parseFeed(request.responseText, callback);
		
    }
  }
}

// Extracted to a function: in the future we may want more intelligent
// delay (i.e. backoff).
function getRetryDelay() {
  return CONFIG_RETRY_DELAY_MS;
}


// ---------------------- Drawing code ------------------------

function draw(entries) {
  entryList.clearItems();

  debug.trace('Adding entries.');
  // If no entry data, indicate error.
  if (!entries) {
    debug.trace('No entries data, displaying default error.');
    entryList.displayMessage(strings.TRYING_TO_CONNECT);
  } else {
    for (var i = 0; i < entries.length && i < CONFIG_MAX_ENTRIES; ++i) {
      entryList.addItem(entries[i]);
    }
    lastEntries = entries;
  }

  entryList.resize(view.width, view.height);
}

function button2_onclick() {
combobox1.addCustomMenuItems = function(menu){
menu.add("asdf");
}
}
