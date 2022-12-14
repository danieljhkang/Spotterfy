# Spotterfy

Github Repository : 
https://github.com/danieljhkang/Spotterfy

A project by Rohan Balani, Daniel Kang, Ryan Lee, and Ken Yun

Project : Upgraded Stevens Gym Website (Stevens Spotter-fy)

Reasoning : Upon using the new Stevens UCC gym reservation, we found that there were many inconveniences and difficulties when dealing with the entire gym booking process.

Core Features : 
1. First Time User Access Account Creation
2. Time Reservation (To the 20 minute) - 20 minute minimum, 2 hour maximum
3. Location Selection (extension of functionality to the Schaefer Gym)
4. Graph showing how many currently has booked for that particular sign in time for that specific day
5. User page displaying personal information like name, email, CWID
6. Users can view how many times they’ve checked in that week
7. Users can view all their current reservations
8. Users can view how many times they’ve missed their reservations 
9. Users can see other users who are at the gym currently
10. Users can toggle a public/private mode based on if they want to be viewed or not
11. Highlight ‘Hot Zones’ (worst times to go), ‘Free Zones’ (best time to go) - This will be based on the averages of the data that has been accumulated
12. Can also view what a person’s workout of the day is (Upper, Lower, Legs, Stretching, Yoga, Cardio, Other, etc.)

Directions on how to run (Assuming npm/node.js is installed): 
1. Install all dependencies/node modules using "npm i"
2. Run the database dump/seeding using "npm run seed"
3. Start the application using "npm start"
4. Go to the localhost port at "http://localhost:3000" on any browser

Registration Requirements : 
Email/Username:
1. An email with a Stevens domain (@stevens.edu)
Password:
1. 6+ Characters long
2. 1+ uppercase letter
3. 1+ lowercase letter
4. 1+ Number
5. 1+ Special character