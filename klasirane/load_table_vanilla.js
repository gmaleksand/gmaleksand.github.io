document.addEventListener("DOMContentLoaded", function() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "physindex.json", true);
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      var data = JSON.parse(this.responseText);
      var rows = ''; // Create an empty string to store the new rows
      data.persons.forEach(function(item, index) {
        rows += '<tr><td>' + item.fname+ ' ' +item.lname + '</td>';
        rows += '<td>' + item.grade + '</td><td>'+item.school +'</td><td>'+item.city +'</td>';
        item.arr.forEach(function(arrItem, arrIndex){
          rows += '<td>' + arrItem + '</td>';  // Add a new cell for each element in the arr array
        });
        rows += '</tr>'; // Add a new row for each item in the JSON data

      });
      document.querySelector("#myTable tbody").innerHTML = rows;
    }
  };
  xhr.send();
});