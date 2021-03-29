/************************
Usage

* NOTE: For this to work, you would need to open our redirect files in excel, and import as data - then save as
* existing_redirects.csv, then run the NODE command below
*
*

node covertCSV.js incoming_redirects.csv existing_redirects.csv > existing_redirects.txt
I started to use TSV (Tab seperated values with existing redirects as I found that to be easier). 
CSV column A contains base URL and column B contains the Redirect URL. 
************************/
const { pipeline } = require('stream');

var fs = require('fs');

var newRedirectsBuffer = '';
var existingRedirectsBuffer = '';

// Storage arrays for new redirect rules


// manually setting this to true, for ADDs currently, come up with a better solution. 
// set addNew to true, if the sheet you're using is only ADDs - as this would create new redirects for all values. 
// default: false for edits. 
var addNew = false;

var newRedirects = fs.createReadStream(process.argv[process.argv.length - 2]);
var existingRedirects = fs.createReadStream(process.argv[process.argv.length - 1]);



newRedirects.addListener('data', function(data){
	newRedirectsBuffer += data.toString();
});

var urlsArray = [];
var urlDestination = [];

var done = false;

newRedirects.addListener('end', function(){
	var parts = newRedirectsBuffer.split('\r\n');
	for (var p = 0; p < parts.length; p++) {
			if (parts[p].length !== 0) {
				urls = parts[p].split(",");
				// this url changes depedning on the site you're targeting
				// https://www.freedom55financial.com
				// https://www.canadalife.com
				// https://www.greatwestlife.com
				if( urls[0].search('https://www.greatwestlife.com') !== -1) {
					urls[0] = urls[0].replace(/\s|(http:\/\/www)/g,'');
                    var pathname = new URL(urls[0]).pathname;
					urlSplit = urls[0].split("/");
					urlsArray.push(pathname)
					urlDestination.push(urls[1].replace(/ /g,''));
				
				}
			}
	}
	done = true;
	existingRedirects.addListener('data', function(data){
		existingRedirectsBuffer += data.toString();
	})	
});



existingRedirects.addListener('end', function(){
		var existingparts = existingRedirectsBuffer;
		if (urlsArray.length == urlDestination.length) {
			let existingURLS = existingparts.split('\r\n');
			for (var i = 0; i < existingURLS.length; i++) {
				let currentURL = existingURLS[i].split("\t");
	
				const found = urlsArray.indexOf(currentURL[0]);
				
				if (found >-1) {
					// create the new redirect rule - if path matches the existing path in original redirects. 
					console.log(urlsArray[found] + "	" + urlDestination[found].replace(/ /g,''));
				}
				else {
					// otherwise maintain existing redirect rules
					console.log (currentURL[0] + "	" + currentURL[1].replace(/ /g,''));
				}
			}
			
			if (addNew) {
				for (var i = 0; i < urlDestination.length; i++) {
					console.log(urlsArray[i] + "	" + urlDestination[i].replace(/ /g,''));
				}
			}
		}
});


