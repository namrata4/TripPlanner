/**
 * 
 */
var googAuth;
  
  var im,
  rootim,
  tripim,
  store,
  previous,
  associations,
  selectedAssociation,
  dropboxClientCredentials, // Credentials used to authenticate Dropbox Client
  dropboxClient,
  currentCell

var authenticatedClient = null;
  
  dropboxClientCredentials = {
		    key: 'dg26gikgqp6e2fn',
		    secret: 'vthc3wdb5nixnnx'
		};

		// Make an new instance of a Dropbox Client with our credentials
		dropboxClient = new Dropbox.Client(dropboxClientCredentials);

		// Tell the client to open up our popup on authentication
		dropboxClient.authDriver(new Dropbox.AuthDriver.Popup({
		    receiverUrl: 'http://localhost:8080/FinalProject/popupFile.html'
		}));

 
  
  var CLIENT_ID="74898333507-gjk0nqf1olseh5a23mjn7p9k2plrhs1u.apps.googleusercontent.com";
  var SCOPES = ['https://www.googleapis.com/auth/drive'];
  
  
  Object.size = function(obj) {
	    var size = 0, 
	    	key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};
  
  
	function connectDropbox() {
		debugger;
	    // Set the
	    store = "Dropbox";
	        // If there is already an authenticated client, don't try to authenticate again
	    if(authenticatedClient) {
	      console.log('Dropbox authenticated');
	      
	    } else {
	        console.log('Dropbox authenticating...');
	      
	        dropboxClient.authenticate(function (error, client) {
	                        // If an error occurs in authentication, log it
	            if(error) {
	                console.log('Dropbox failed to authenticate');
	            
	            } else {
	                                // Set global variable to authenticated client
	                authenticatedClient = client;
	                                
	                console.log('Dropbox authenticated');
	                                // Construct the root itemMirror object (more on this in next section)
	               constructIMObject(store);
	            }
	        });
	    }
	}
	
	
  function authorizeDrive(){
	  
		
	  
	  gapi.load('auth2', function () {
          gapi.auth2.init({
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          })
          
          googAuth= gapi.auth2.getAuthInstance();
           })
           
          setTimeout(checkSignin, 1000);
  }
	  
function checkSignin(){
	console.log('Checking Auth')
	var ret;
    if (googAuth.isSignedIn.get()) {
      loadDriveAPI()
     // createBaseFolderStructure();
    } else {
      console.log('Attempting Sign In')
      // Need to have them sign in
      googAuth.signIn().then(function () {
		console.log('AUTH SUCCESS')
        loadDriveAPI()
      //  createBaseFolderStructure();
      }, function (error) {
        // Failed to authenticate for some reason
		console.log('AUTH FAILED')
        googleAuth.reject(error)
       
      })
    }
    return ret;
	}
	
function loadDriveAPI(){
	
	 gapi.client.load('drive', 'v2', function () {
         // Once this callback is executed, that means we've authorized just as expected
         // and can therefore resolve the promise
         connectDrive()
       })
}

function connectDrive () {
    console.log('Attempting to connect')
    store = 'Google Drive'

    console.log('Successful Authentication!')
    authenticatedClient = gapi.client

    // Now we start dealing with item-mirror
   constructIMObject(store);
  }
  
function constructIMObject (store) {
	debugger;
	  im = new ItemMirror('Thisisastring', function (error, newMirror) {
	    if (error) {
	      console.log(error)
	    } else {
	      im = newMirror;
	      rootim=newMirror;
	      // if(pathURI == "/") {
	      //     handleLastNavigated(newMirror)
	      // }
	      // Check to see which of the returned items is the correct store, and navigate into that mirror
	      if (store) {
	        associations = im.listAssociations()
	        for (var i = 0; i < associations.length; i++) {
	          var displayText = im.getAssociationDisplayText(associations[i])
	          if (displayText == store) {
	            navigateMirror(associations[i])
	           rootim=im;
	          }
	        }
	      } else {
	       refreshIMDisplay()
	        
	      }
	    
	    }
	  })
	  
	}

	// Attempts to navigate and display a new itemMirror association
function navigateMirror(guid) {
	im.createItemMirrorForAssociatedGroupingItem(guid, function(error, newMirror) {

		if(!error) {
			im = newMirror;
			  createBaseFolderStructure();

      if(!rootim) {
    	  rootim = im; // Save root to be used for home button and root fragment saving
      }

      refreshIMDisplay();
		} else {
			console.log(error);
		}
	});

}
	function refreshIMDisplay () {
		/* var div= document.getElementById("authorize-div");
		div.style.display="none"; */
		  associations = im.listAssociations()
		  var length = associations.length

		  // Grab associations and organize them by type
		  var groupingItems = []
		  var nonGroupingItems = []
		  for (var i = 0; i < length; i++) {
		    if (im.isAssociationAssociatedItemGrouping(associations[i])) {
		      groupingItems.push(associations[i])
		    } else {
		      nonGroupingItems.push(associations[i])
		    }
		  }
	 
		}
	
	
	 function addColumn(tblId)
	 {
	 	
	 	for(var i = 1; i <= days; i++){
	 	var tblHeadObj = document.getElementById(tblId).tHead;

	 	for (var h=0; h<tblHeadObj.rows.length; h++) {
	         // console.log("2")
	        
	 		var newTH = document.createElement('th');
	 		
	 		tblHeadObj.rows[h].appendChild(newTH);
	 		 newTH.innerHTML = 'Day '+i;
	 	}
	 	
	 	var tblBodyObj = document.getElementById(tblId).tBodies[0];
	 	
	 	
	 		
	 	for (var j=0; j<tblBodyObj.rows.length; j++) {
	 		// console.log(tblBodyObj);
	 		//console.log("2")
	 		var newCell = tblBodyObj.rows[j].insertCell(-1);
	 		var id;
	 		id = "cell"+i+j;
	 		newCell.setAttribute("id",id);
	 		if (0<j && j<tblBodyObj.rows.length-1){
	 		
	 			newCell.setAttribute("class","cellRightClick");
	 		}
	 		
	 		newCell.setAttribute("parentid",daysId["Day"+i]);
	 		newCell.setAttribute("isFolderCreated",false);
	 		newCell.onclick=function () {
	 			tableCellClick(this);
	        };
	 		// newCell.innerHTML = '[td] row:' + j + ', cell: ' + (tblBodyObj.rows[j].cells.length - 1)
	 	}
	 	}
	 }
	
	function createFolder(parentId, folderName,cell){
		debugger;
		var i = googAuth.currentUser.get().getAuthResponse();
		var AUTH_HEADER = {
                Authorization: "Bearer " + i.access_token
            }
		var DRIVE_FILE_API = "https://www.googleapis.com/drive/v2/files/";
		var FOLDER_MIMETYPE = "application/vnd.google-apps.folder";
		
		 var metadata= {
                 mimeType: FOLDER_MIMETYPE,
                 title: folderName,
                 parents:[{"id": parentId}]
             }
         $.post({
             url: DRIVE_FILE_API,
             headers: AUTH_HEADER,
             data: JSON.stringify(metadata),
             contentType: "application/json; charset=utf-8",
             dataType   : "json"
         }).then(function(t) {
             cell.setAttribute("id", t.id);
             cell.setAttribute("isFolderCreated",true);
             currentCell= t.id;
             $('#cellClick').modal('show');
          
         }).fail(function() {
             alert("Failed to make POST request for new grouping item. Check network requests for more deatils")
         })
		
		
	}
	
	function createFile(parentId, name, text){
		var i = googAuth.currentUser.get().getAuthResponse();
		var AUTH_HEADER = {
                Authorization: "Bearer " + i.access_token
            }
		var DRIVE_FILE_API = "https://www.googleapis.com/drive/v2/files/";
		
		 var metadata= {
                 title: name,
                 parents:[{"id": parentId}]
             }
         $.post({
             url: DRIVE_FILE_API,
             headers: AUTH_HEADER,
             data: JSON.stringify(metadata),
             contentType: "application/json; charset=utf-8",
             dataType   : "json"
         }).then(function(t) {
             updateFile(t.id, parentId, text);
         }).fail(function() {
             alert("Failed to make POST request for new grouping item. Check network requests for more deatils")
         })
		
		
		
	}
	function updateFile(fileId, folderId, text, callback) {

	    const boundary = '-------314159265358979323846';
	    const delimiter = "\r\n--" + boundary + "\r\n";
	    const close_delim = "\r\n--" + boundary + "--";

	    var contentType = "text/html";
	    var metadata = {'mimeType': contentType,};

	    var multipartRequestBody =
	        delimiter +  'Content-Type: application/json\r\n\r\n' +
	        JSON.stringify(metadata) +
	        delimiter + 'Content-Type: ' + contentType + '\r\n' + '\r\n' +
	        text +
	        close_delim;

	    if (!callback) { callback = function(file) { console.log("Update Complete ",file) }; }

	    gapi.client.request({
	        'path': '/upload/drive/v2/files/'+folderId+"?fileId="+fileId+"&uploadType=multipart",
	        'method': 'PUT',
	        'params': {'fileId': fileId, 'uploadType': 'multipart'},
	        'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
	        'body': multipartRequestBody,
	        callback:callback,
	    });
	  }
	
	function tableCellClick(cell)
	{
	if(store=='Google Drive')	
	{
	var parentId= cell.getAttribute("parentId");
	var parentgui= cell.getAttribute("parentgui");
	var folderName= cell.parentNode.id;
	var isFolderCreated= cell.getAttribute("isFolderCreated");
	var dayim;
	var modalTitle= document.getElementById("modalTitle");
	modalTitle.innerHTML=folderName;
	document.getElementById("titleCell").value="";
	document.getElementById("notes").value="";
	document.getElementById("links").value="";
	
	if(folderName=="Departure"|| folderName=="Arrival"){
		
		cell.contentEditable = true;
	}
	
	else if(parentId!=null && folderName!=null && isFolderCreated=="false"){
		
		createFolder(parentId, folderName,cell);
		
	}
	
	else if(isFolderCreated=="true"||isFolderCreated==true)
		{
		var folderName= cell.parentNode.id;
		var modalTitle= document.getElementById("modalTitle1");
		modalTitle.innerHTML=folderName;
		currentCell= cell.getAttribute("id");
		$('#cellClick').modal('show');
		}
	}
	else if(store=="Dropbox")
		{
		currentCell= cell.getAttribute("id");
		$('#dropboxCell').modal('show');
		
		}
	
	}
	
	function saveDropNotes(){
		var cell= document.getElementById(currentCell);
		cell.innerHTML= document.getElementById("titleCell1").value;
	}
	
	function openinDrop(){
		var cell= document.getElementById(currentCell);
		var url= tripim.getPublicURL(cell.getAttribute("parentid"));
			window.open(url);
	}
	
	
	function saveNotes(){
		
		var notes= document.getElementById("notes").value;
		var links= document.getElementById("links").value;
		var text= notes+links;
		if(currentCell==null){		
				setTimeout(createFile(currentCell,"Notes",text), 1000);
		}else{
			createFile(currentCell,"Notes",text);
		}
		
		document.getElementById(currentCell).innerHTML=document.getElementById("titleCell").value;
		
		
	}
	
	function openinDrive(){
		document.getElementById(currentCell).innerHTML=document.getElementById("titleCell").value;
		window.open("https://drive.google.com/folderview?id="+currentCell);
		
		
	}
	
	function openTrip(){
		if(store=='Google Drive')	
		{		
		window.open("https://drive.google.com/folderview?id="+daysId[tripName]);
		}
		else if(store=="Dropbox"){
			
			var url= tripim.getPublicURL(daysId[tripName]);
				window.open(url);
		}
	}
	function createBaseFolderStructure(){
		debugger;
		var options= [
		              {
		 "displayText":tripName,
		"localItem":"TimePlates",
		"isGroupingItem":"true"}];
		
		im.createAssociation(options[0], function(error,GUID){
			if(!error)
				{
				
				im.createItemMirrorForAssociatedGroupingItem(GUID, function (error, newMirror) {
				    if (!error) {
				    	tripim = newMirror
				    	tripim.setDisplayName(tripName);
				    	
				    	for(var k=1; k<=days; k++){
				    		debugger;

				    		var options1= [
								              {
								         		 "displayText":"Day" +k,
								         		"localItem":"Day" +k,
								         		"isGroupingItem":"true"}];
							tripim.createAssociation (options1[0], function(error,GUID1){
								if(!error)
								{
									
								}
							
						});	
				    	
				    		
				    	}
				    	 document.getElementById("wait").style.display="none";
				    	document.getElementById("mainDiv").style.display="block";
				    
				    } 
				  })
				}
			
			
		});
	
	
	
		
	}
  
  
  