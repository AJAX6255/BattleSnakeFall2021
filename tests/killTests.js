const test1 = {
  "name": "Very good kill opportunity",
  "expected": "right",
  "json": {"game":{"id":"acd7455e-435f-408a-a103-04cad04d6c42"},"turn":81,"board":{"height":11,"width":11,"food":[{"x":3,"y":4}],"snakes":[{"id":"c392a229-6bc1-4f68-bc76-8785903750a4","name":"zerocool","health":75,"body":[{"x":5,"y":4},{"x":5,"y":3},{"x":4,"y":3},{"x":4,"y":2},{"x":4,"y":1}]},{"id":"773bb6a0-2fe5-4e98-9b84-5471b68b2d12","name":"chicken1","health":93,"body":[{"x":8,"y":9},{"x":8,"y":10},{"x":9,"y":10},{"x":9,"y":9}]},{"id":"8da1bf53-3198-4b01-bbf8-20b1021fbe6e","name":"wildcrazy2","health":84,"body":[{"x":3,"y":6},{"x":2,"y":6},{"x":2,"y":7},{"x":2,"y":8},{"x":3,"y":8},{"x":4,"y":8},{"x":5,"y":8},{"x":6,"y":8},{"x":7,"y":8},{"x":7,"y":7},{"x":6,"y":7},{"x":5,"y":7},{"x":4,"y":7}]},{"id":"6f4ec04c-d1cb-4f4d-9baa-32e20f18ff0e","name":"karena1","health":92,"body":[{"x":8,"y":5},{"x":8,"y":6},{"x":9,"y":6},{"x":9,"y":7},{"x":8,"y":7}]},{"id":"e01dee84-e1ed-46c8-9b84-09c0f136fd89","name":"chicken2","health":19,"body":[{"x":7,"y":4},{"x":7,"y":3},{"x":8,"y":3}]},{"id":"3a03d86d-1171-4379-b92d-ee2a3987803f","name":"zerocool24","health":96,"body":[{"x":5,"y":6},{"x":6,"y":6},{"x":7,"y":6},{"x":7,"y":5},{"x":6,"y":5}]}]},"you":{"id":"c392a229-6bc1-4f68-bc76-8785903750a4","name":"zerocool","health":75,"body":[{"x":5,"y":4},{"x":5,"y":3},{"x":4,"y":3},{"x":4,"y":2},{"x":4,"y":1}]}}
};

const test2 = {
  "name": "Trying to kill but leads to dead end",
  "expected": "left",
  "json": {"game":{"id":"bc11bccb-5a24-43f5-ae84-56d416c2a7ef"},"turn":210,"board":{"height":11,"width":11,"food":[{"x":4,"y":2},{"x":4,"y":0}],"snakes":[{"id":"9976298a-fb3c-4265-8eb8-b422bdeb0828","name":"zerocool","health":92,"body":[{"x":1,"y":5},{"x":1,"y":4},{"x":2,"y":4},{"x":2,"y":3},{"x":2,"y":2},{"x":2,"y":1},{"x":2,"y":0},{"x":1,"y":0},{"x":0,"y":0},{"x":0,"y":1},{"x":1,"y":1},{"x":1,"y":2}]},{"id":"9e2eedac-e021-4cef-9be2-7015da06eb6c","name":"chicken1","health":87,"body":[{"x":2,"y":6},{"x":1,"y":6},{"x":0,"y":6},{"x":0,"y":7},{"x":0,"y":8},{"x":1,"y":8},{"x":2,"y":8},{"x":2,"y":7}]},{"id":"e56d482e-aede-411a-bd47-709ea0d0187f","name":"wildcrazy1","health":94,"body":[{"x":5,"y":5},{"x":5,"y":6},{"x":4,"y":6},{"x":4,"y":7},{"x":4,"y":8},{"x":3,"y":8},{"x":3,"y":7},{"x":3,"y":6},{"x":3,"y":5},{"x":3,"y":4},{"x":3,"y":3},{"x":4,"y":3},{"x":5,"y":3},{"x":6,"y":3},{"x":7,"y":3},{"x":7,"y":2},{"x":8,"y":2},{"x":8,"y":3},{"x":9,"y":3},{"x":10,"y":3}]},{"id":"50c2355e-ac8b-4d43-b013-0ae99ea6bf0c","name":"wildcrazy2","health":56,"body":[{"x":6,"y":10},{"x":7,"y":10},{"x":8,"y":10},{"x":9,"y":10},{"x":9,"y":9},{"x":9,"y":8},{"x":10,"y":8},{"x":10,"y":7},{"x":10,"y":6},{"x":10,"y":5},{"x":9,"y":5},{"x":9,"y":6},{"x":8,"y":6},{"x":8,"y":7},{"x":7,"y":7},{"x":7,"y":6},{"x":6,"y":6},{"x":6,"y":7},{"x":5,"y":7}]}]},"you":{"id":"9976298a-fb3c-4265-8eb8-b422bdeb0828","name":"zerocool","health":92,"body":[{"x":1,"y":5},{"x":1,"y":4},{"x":2,"y":4},{"x":2,"y":3},{"x":2,"y":2},{"x":2,"y":1},{"x":2,"y":0},{"x":1,"y":0},{"x":0,"y":0},{"x":0,"y":1},{"x":1,"y":1},{"x":1,"y":2}]}}
};

module.exports = {
  tests: [
    test2
  ]
};