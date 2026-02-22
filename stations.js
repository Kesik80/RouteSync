// реестр имен
const defaultCoords = {
  'Sergii': {lat: 51.530133, lng: 6.850858},
  'Anatolii': {lat: 51.522694, lng: 6.858944},
  'Andrii': {lat: 51.534558, lng: 6.861061},
  'Sergio': {lat: 51.52, lng: 6.887619},
  'Dima': {lat: 51.551753, lng: 7.102285},
  'René': {lat: 51.476281, lng: 6.861856},
  'Marvin': {lat: 51.556472, lng: 6.731424},
  'Vasyl': {lat: 51.515355, lng: 6.893655},
  'Alex': {lat: 51.515355, lng: 6.893655},
  'Maikel': {lat: 51.539072, lng: 7.0090119}
};

// реестр станций
this.stations = {
  'Gelsenkirchen-Bismarck': {lat: 51.538627, lng: 7.108037},
  'Hagen': {lat: 51.373517, lng: 7.461144},
  'Essen West': {lat: 51.4539273, lng: 6.9794622},
  'Gelsenkirchen Horst': {lat: 51.5415351, lng: 7.0202811},
  'Gelsenkirchen Horst 2': {lat: 51.539072, lng: 7.0090119}
};

// Время в пути между участниками
this.travelTimes = {
  'Sergii-Anatolii': 5,
  'Sergii-Andrii': 5,
  'Sergii-Sergio': 10,
  'Sergii-Dima': 30,
  'Andrii-Anatolii': 5,
  'Andrii-Sergio': 10,
  'Andrii-Dima': 25,
  'Anatolii-Sergio': 10,
  'Anatolii-Dima': 25,
  'Sergio-Dima': 30,
  'Marvin-Sergii': 20,
  'Marvin-Anatolii': 20,
  'Marvin-Andrii': 20,
  'Marvin-Sergio': 25,
  'Marvin-Dima': 30,
  'Maikel-Sergii': 25,
  'Maikel-Andrii': 20,
  'Maikel-Anatolii': 20,
  'Maikel-Sergio': 25,
  'Maikel-Dima': 30,
  'Maikel-Marvin': 5,
  'René-Sergii': 15,
  'René-Andrii': 15,
  'René-Anatolii': 15,
  'René-Sergio': 15,
  'René-Dima': 30,
  'René-Marvin': 20,
  'René-Maikel': 20,
  'Vasyl-Sergii': 15,
  'Vasyl-Andrii': 10,
  'Vasyl-Anatolii': 10,
  'Vasyl-Sergio': 5,
  'Vasyl-Dima': 30,
  'Vasyl-Marvin': 20,
  'Vasyl-Maikel': 20,
  'Vasyl-René': 15,
  'Alex-Sergii': 15,
  'Alex-Anatolii': 10,
  'Alex-Andrii': 10,
  'Alex-Sergio': 5,
  'Alex-Dima': 30,
  'Alex-René': 15,
  'Alex-Marvin': 20,
  'Alex-Vasyl': 0,
  'Maikel-René': 25,
  'Maikel-Vasyl': 20,
  'Maikel-Alex': 20
};

// Пункты встречи (Treffpunkt)
this.treffpunkt = {
  'OLGA-Park': {lat: 51.5004335, lng: 6.8686337},
  'Gelsenkirchen-Treffpunkt': {lat: 51.530304, lng: 7.110901}
};

// Время в пути от пункта встречи до каждого участника
this.trefftravelTimes = {
  'OLGA-Park-Sergii': 10,
  'OLGA-Park-Andrii': 10,
  'OLGA-Park-Anatolii': 10,
  'OLGA-Park-Sergio': 10,
  'OLGA-Park-Dima': 25,
  'OLGA-Park-Marvin': 15,
  'OLGA-Park-Maikel': 20,
  'OLGA-Park-René': 10,
  'OLGA-Park-Vasyl': 10,
  'Gelsenkirchen-Treffpunkt-Sergii': 30,
  'Gelsenkirchen-Treffpunkt-Andrii': 30,
  'Gelsenkirchen-Treffpunkt-Anatolii': 30,
  'Gelsenkirchen-Treffpunkt-Sergio': 25,
  'Gelsenkirchen-Treffpunkt-Dima': 10,
  'Gelsenkirchen-Treffpunkt-Marvin': 20,
  'Gelsenkirchen-Treffpunkt-Maikel': 20,
  'Gelsenkirchen-Treffpunkt-René': 35,
  'Gelsenkirchen-Treffpunkt-Vasyl': 25
};

// Приоритетные списки остановок
this.participantOrders = {
  'Sergii': ["Anatolii","Sergio",{"main":"Vasyl","subParticipants":["Alex","René"]}],
  'Anatolii': ["Sergii","Andrii","Sergio","Vasyl"],
  'Andrii': ["Sergii","Anatolii","Sergio","Dima"],
  'Sergio': ["Anatolii","Sergii","Andrii","Dima"],
  'Dima': ["Anatolii","Sergii","Andrii","Sergio"]
};