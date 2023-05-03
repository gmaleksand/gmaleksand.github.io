function grade(num) {
  var table, tr, td, i, txtValue;
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.innerText;
      var compare = (txtValue == num)||(num == 0)||(num == 13 && txtValue >13);

      if (compare) {
        tr[i].className = tr[i].className.replace("grade_mismatch","");
        if (tr[i].className.search('_mismatch') == -1){
          tr[i].style.display = "";
        }
      }
      else {
        tr[i].style.display = "none";
        if (tr[i].className.search('grade_mismatch') == -1){
          tr[i].className += " grade_mismatch";
        }
      }
    }
  }
}


function school(str){
  var table, tr, td, i, txtValue;
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");


  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[2];
    if (td) {
      txtValue = td.innerText;
      var compare = txtValue == str||str == 0
      if (str == -1){
        compare = !['СМГ', 'НПМГ', 'ПЧМГ','АК','МГ “Д-р Петър Берон“','ППМГ “Акад. Н. Обрешков“','ППМГ “Акад. Иван Ценов“','МГ “Гео Милев“','МГ “Акад. Кирил Попов“','ППМГ “Никола Обрешков“'].includes(txtValue);
      }
      if (compare) {
        tr[i].className = tr[i].className.replace("school_mismatch","");
        if (tr[i].className.search('_mismatch') == -1){
          tr[i].style.display = "";
        }
      } else {
        tr[i].style.display = "none";
        if (tr[i].className.search('school_mismatch') == -1){
          tr[i].className += " school_mismatch";
        }
      }
    }
  }
}



function city(str){
  var table, tr, td, i, txtValue, compare;
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[3];
    if (td) {
      txtValue = td.innerText;
      compare = (txtValue == str)||(str == 0)
      if (str == -1){
        compare = !['София','Варна','Бургас','Плевен','Враца','Пловдив','Казанлък','Габрово','Велико Търново','Русе','Сливен','Добрич','Благоевград','Козлодуй','Ямбол','Стара Загора','Гоце Делчев','Видин','Силистра','Шумен','Кюстендил','Перник'].includes(txtValue);
      }
      if (compare) {
        tr[i].className = tr[i].className.replace("city_mismatch","");
        if (tr[i].className.search('_mismatch') == -1){
          tr[i].style.display = "";
        }
      } else {
        tr[i].style.display = "none";
        if (tr[i].className.search('city_mismatch') == -1){
          tr[i].className += " city_mismatch";
        }
      }
    }
  }
}

function search(query) {
  var filter, table, tr, td, i, txtValue;
  filter = query.toUpperCase()
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1 && tr[i].className.search('_mismatch') == -1) {
        tr[i].style.display = "";
      }
      else {
        tr[i].style.display = "none";
      }
    }       
  }
}