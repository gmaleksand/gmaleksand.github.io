  $(document).ready(function() {
    //if($(window).scrollTop() == $(document).height() - $(window).height()) {
      $.getJSON('physindex.json', function(data) {
        var rows = ''; // Create an empty string to store the new rows
        $.each(data.persons, function(index, item) {
          rows += '<tr><td>' + item.fname+ ' ' +item.lname + '</td>';
          rows += '<td>' + item.grade + '</td><td>'+item.school +'</td><td>'+item.city +'</td>';
          $.each(item.arr, function(arrIndex, arrItem) {
            rows += '<td>' + arrItem + '</td>'; // Add a new cell for each element in the arr array
          });
          rows += '</tr>'; // Add a new row for each item in the JSON data
        });
        $('#myTable tbody').append(rows); // Append the new rows to the table
      });
    //}
  });

//$("table.altRow tr:visible").each(function( index ) {  
//    $(this).css("background-color", ( index % 2 ? "#DEDFDE" : "#EEECEE" ));
//});