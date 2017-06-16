var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
		this.testScript();
    },

	testScript: function() {


		document.getElementById("createFile").addEventListener("click", createFile);
		document.getElementById("writeFile").addEventListener("click", writeFile);
		document.getElementById("readFile").addEventListener("click", readFile);
		document.getElementById("removeFile").addEventListener("click", removeFile);



		function createFile() {
			var type = window.PERSISTENT;
			var size = 5*1024*1024; // 5 Mb

			window.requestFileSystem(type, size, successCallback, errorCallback);

			function successCallback(fs) {
				fs.root.getFile('testlogfile.txt', {create: true, exclusive: true}, function(fileEntry) {
					alert('File creation successfull!');
				}, errorCallback);
			};

			function errorCallback(error) {
				alert("ERROR: " + error.code);
			};

		};

		function writeFile() {
			var type = window.PERSISTENT;
			var size = 5*1024*1024;

			window.requestFileSystem(type, size, successCallback, errorCallback);

			function successCallback(fs) {

				fs.root.getFile('testlogfile.txt', {create: true}, function(fileEntry) {

					fileEntry.createWriter(function(fileWriter) {

						fileWriter.onwriteend = function(e) {
							alert('Write completed.');
						};

						fileWriter.onerror = function(e) {
							alert('Write failed: ' + e.toString());
						};

						var textData = document.getElementById('textarea').value;
						var blob = new Blob([textData], {type: 'text/plain'});

						fileWriter.write(blob);
					}, errorCallback);

				}, errorCallback);

			};

			function errorCallback(error) {
				alert("ERROR: " + error.code);
			};

		};

		function readFile() {
			var type = window.PERSISTENT;
			var size = 5*1024*1024;

			window.requestFileSystem(type, size, successCallback, errorCallback);

			function successCallback(fs) {

				fs.root.getFile('testlogfile.txt', {}, function(fileEntry) {

					fileEntry.file(function(file) {
						var reader = new FileReader();

						reader.onloadend = function(e) {
							var txtArea = document.getElementById('textarea');
							txtArea.value = this.result;
						};

						reader.readAsText(file);

					}, errorCallback);

				}, errorCallback);
			};

			function errorCallback(error) {
				alert("ERROR: " + error.code);
			};

		};

		function removeFile() {
			var type = window.PERSISTENT;
			var size = 5*1024*1024;

			window.requestFileSystem(type, size, successCallback, errorCallback);

			function successCallback(fs) {
				fs.root.getFile('testlogfile.txt', {create: false}, function(fileEntry) {

					fileEntry.remove(function() {
						alert('File removed.');
					}, errorCallback);

				}, errorCallback);
			};

			function errorCallback(error) {
				alert("ERROR: " + error.code);
			};

		};


	}
};

app.initialize();