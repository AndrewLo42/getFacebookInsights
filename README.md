# What is this?
A roughly coded way to get Facebook Business data from their Graph API. 

The API is really annoying to decipher sometimes and some of the data doesn't match with what is displayed on the business suite interface...

This is all connected to Microsoft SQL Server on Azure. 

# Need to do
- Clean up code 
    - Need to cut up chunks of code in index.js into their own file for readability
    - Will also allow for obtaining data from one segment (like only leads) instead of going through EVERYTHING
- Find a way to obtain leads that are listed on Business Suite but not through APIs
    - Might be bugged on FaceBook's end? 
- Get accurate reach number (Might be different due to Facebook error? Sometimes their own numbers on business suite don't even add up)

# HOW TO USE 
## As a dev
- Obtain your Access Key following instructions that Facebook provides (may need a long term key)
- Enter all relevent information into a .env file
- For single account testing, make a variable and call FBInsights, passing relevent data. Comment out allData section.

The flow starts at sqlconnect.js into index.js. It goes from run to getAccountInfo to uploadData where FBInsights executes a whole bunch of promise chains obtaining data and uploading them.
- Which is why I want to eventually break everything up into their own files/functions for cleanliness and single insight usage.

## As client/tester
- Open your favorite CLI.
- Have npm installed. Have node globally installed.
- In the root directory, run npm install.

- Once set up, use **npm run connect** to obtain data for *this year* only.
- control + c to terminate the process once it has finished running, stuck, or to abort at any time.
## Modifications

Date 
- index.js line 9 will adjust that.

## Other useful information
run *node sqlconnect.js* to manually run the program

## Thoughts and processes (outdated)
- sqlconnect.js establishes a connection with the database
- it will then call the chain of functions in index.js
    - due to JavaScript's syncronous nature, we use a handful of promise chains to ensure everything is run the way it should
    - this does have looping through the accounts make a SQL request per loop
    - as such, I am not closing the connection, unsure how to ensure it at the end, but should be fine
- perhaps we can modify this to return a CSV file?
- to give this to a client, we could create a small frontend site for this (hosted on a free server) and have a simple button that will fetch data based on time ranges that we are interested in?
