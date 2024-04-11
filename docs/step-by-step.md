## Step by Step User Journey

### Data Preparation

1. Data Provider creates a valid file that contains carbon footprint data. The data must be grouped by month

- There are data model validation endpoints that run data model validation on a file. This makes the process easier for the data providers

2. Data Provider puts the file in an S3 bucket or Azure Blob or any public API endpoint

### Data Sharing

3. Data Provider uses the API to share data to another participant. They do this by specifying:

- month
- year
- client_id
- details of the data source(eg URL, S3 bucket details etc. [See postman docs](https://documenter.getpostman.com/view/27072999/2s9YXia2Sj))

4. Data Consumer initiate file transfer by specifying the `month` and `year`. This gives the user a jobId that he can use to get the actual data
5. Data Consumer requests actual data using the jobId
