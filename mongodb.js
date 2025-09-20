// users
{ name: "Rahmat", phone: "08112237790" },
  { name: "Azis", phone: "08112237777" },
  { name: "Himawan", phone: "08112237778" },
  { name: "Tsubasa", phone: "08312312377" },
  { name: "Himawan", phone: "08112237788" }

// todos

{
    title: "pergi",
    complete: false,
    deadline: new Date("2023-08-25T18:00:00.480Z"),
    executor: db.users.findOne({ name: "Rahmat" })._id
  },
  {
    title: "tidur",
    complete: false,
    deadline: new Date("2025-08-25T18:00:00"),
    executor: db.users.findOne({ name: "Rahmat" })._id
  },