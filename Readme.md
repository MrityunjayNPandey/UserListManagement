1. This is based on expressJS.

To do: 

1. Set up a expressServer.
2. We will have 2 Rest APIs: 
   1. Single creation. //addUser -- input params: name: String!, email: String! and city: string
   2. Bulk creation via CSV.//addUsersViaCSV -- input a CSV file in body
3. Schema (Mongodb): 
   1. Name: string!
   2. email: string!, unique: true,
   3. city: string

CSV logic: 

Validate CSV for the above schema.
A simple for loop with Set data structure for email should do the trick...



