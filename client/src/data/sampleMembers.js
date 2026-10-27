// Curated 250 realistic collegiate student sample members
const rawNames = [
  "Aarav Sharma", "Aditi Rao", "Advait Kulkarni", "Akanksha Verma", "Akhil Nair",
  "Alok Mishra", "Aman Gupta", "Ananya Deshmukh", "Aniket Patil", "Anish Iyer",
  "Anita Roy", "Anjali Singh", "Ankita Joshi", "Anmol Mehta", "Ansh Banerjee",
  "Anushka Reddy", "Apoorva Sen", "Arjun Malhotra", "Arman Khan", "Arnav Kapoor",
  "Aryan Chauhan", "Ashish Saxena", "Avani Bhat", "Ayush Tiwari", "Bhavya Agarwal",
  "Chaitanya Hegde", "Chetan Naidu", "Chirag Mittal", "Deepa Menon", "Deepak Pillai",
  "Deepti Jain", "Dev Bansal", "Devansh Goel", "Dhruv Mathur", "Divya Srivastava",
  "Diya Pandey", "Gaurav Shukla", "Gautam Dubey", "Gayatri Tripathi", "Harish Thakur",
  "Harsh Rathore", "Harshita Yadav", "Hitesh Prasad", "Ishaan Ghosh", "Ishita Dutta",
  "Jatin Mukherjee", "Jay Bose", "Juhi Chatterjee", "Kabir Khanna", "Kajal Das",
  "Karan Pawar", "Karthik Shinde", "Kavita Gaikwad", "Khushi Chowdary", "Krunal Anand",
  "Kunal Sethi", "Lakshya Anand", "Lavanya Kulkarni", "Madhav Joshi", "Malini Iyer",
  "Manan Sharma", "Manish Rao", "Manisha Gupta", "Mansi Singh", "Mayank Patel",
  "Meera Verma", "Mihir Nair", "Mohit Mishra", "Monica Sen", "Muskan Roy",
  "Nakul Deshmukh", "Namrata Patil", "Navin Banerjee", "Neha Reddy", "Nikhil Malhotra",
  "Nikita Kapoor", "Nimit Chauhan", "Nisha Saxena", "Nishant Bhat", "Nitesh Tiwari",
  "Ojas Agarwal", "Palak Hegde", "Pankaj Naidu", "Parul Mittal", "Parth Menon",
  "Payal Pillai", "Pooja Jain", "Poonam Bansal", "Pranav Goel", "Pranay Mathur",
  "Prateek Srivastava", "Prerna Pandey", "Priya Shukla", "Priyanshu Dubey", "Rahul Tripathi",
  "Rajat Thakur", "Rajeev Rathore", "Rakhi Yadav", "Rakesh Prasad", "Ram Ghosh",
  "Ramesh Dutta", "Rashmi Mukherjee", "Ravi Bose", "Riddhi Chatterjee", "Rishabh Khanna",
  "Ritu Das", "Ritwik Pawar", "Riya Shinde", "Rohan Gaikwad", "Rohit Chowdary",
  "Ronit Anand", "Roshni Sethi", "Ruchir Kulkarni", "Sagar Joshi", "Sahil Iyer",
  "Sakshi Sharma", "Saloni Rao", "Sameer Gupta", "Samarth Singh", "Sandeep Patel",
  "Sanjay Verma", "Sanjana Nair", "Sanya Mishra", "Saurabh Sen", "Shailesh Roy",
  "Shalini Deshmukh", "Shivam Patil", "Shreya Banerjee", "Shreyas Reddy", "Shruti Malhotra",
  "Siddharth Kapoor", "Simran Chauhan", "Sneha Saxena", "Soham Bhat", "Sonali Tiwari",
  "Sourabh Agarwal", "Srishti Hegde", "Subhash Naidu", "Sudhir Mittal", "Suman Menon",
  "Sumit Pillai", "Sunny Jain", "Suraj Bansal", "Suresh Goel", "Swati Mathur",
  "Tanmay Srivastava", "Tanya Pandey", "Tanvi Shukla", "Tarun Dubey", "Tejas Tripathi",
  "Tushar Thakur", "Udit Rathore", "Umang Yadav", "Utkarsh Prasad", "Vaibhav Ghosh",
  "Vaishnavi Dutta", "Varun Mukherjee", "Vedant Bose", "Vikas Chatterjee", "Vinay Khanna",
  "Vipul Das", "Vishal Pawar", "Vivek Shinde", "Yash Gaikwad", "Yashika Chowdary",
  "Yuvraj Anand", "Zaid Sethi", "Aaliya Kulkarni", "Abhay Joshi", "Abhinav Iyer",
  "Abhishek Sharma", "Aditya Rao", "Afreen Gupta", "Aishwarya Singh", "Ajay Patel",
  "Akash Verma", "Amrita Nair", "Amey Mishra", "Anil Sen", "Aniruddh Roy",
  "Archana Deshmukh", "Ashutosh Patil", "Asmita Banerjee", "Atharva Reddy", "Avinash Malhotra",
  "Barkha Kapoor", "Bhavesh Chauhan", "Bhumi Saxena", "Bipin Bhat", "Chaitali Tiwari",
  "Chandan Agarwal", "Damini Hegde", "Darshan Naidu", "Disha Mittal", "Dipti Menon",
  "Esha Pillai", "Farhan Jain", "Garima Bansal", "Girish Goel", "Gunjan Mathur",
  "Hardik Srivastava", "Hemant Pandey", "Himanshu Shukla", "Inderjeet Dubey", "Jagdish Tripathi",
  "Janhavi Thakur", "Jaspreet Rathore", "Jitendra Yadav", "Jyoti Prasad", "Kalpesh Ghosh",
  "Kamal Dutta", "Kanika Mukherjee", "Kishore Bose", "Komal Chatterjee", "Kritika Khanna",
  "Kuldeep Das", "Lalit Pawar", "Leela Shinde", "Madhavi Gaikwad", "Mahesh Chowdary",
  "Mandar Anand", "Manjari Sethi", "Mehul Kulkarni", "Mitul Joshi", "Mohan Iyer",
  "Naveen Sharma", "Nayan Rao", "Neelesh Gupta", "Nidhi Singh", "Omkar Patel",
  "Pallavi Verma", "Parikshit Nair", "Piyush Mishra", "Prachi Sen", "Pradeep Roy",
  "Prajakta Deshmukh", "Prashant Patil", "Prathamesh Banerjee", "Preeti Reddy", "Punit Malhotra",
  "Radhika Kapoor", "Raghav Chauhan", "Rajesh Saxena", "Rajshree Bhat", "Ranjan Tiwari",
  "Renuka Agarwal", "Reyansh Hegde", "Richa Naidu", "Rupal Mittal", "Sachin Menon",
  "Sadhana Pillai", "Sameera Jain", "Santosh Bansal", "Sarita Goel", "Saumya Mathur",
  "Shantanu Srivastava", "Shashank Pandey", "Sheetal Shukla", "Shraddha Dubey", "Shrikant Tripathi",
  "Smita Thakur", "Soumya Rathore", "Subhashree Yadav", "Suchitra Prasad", "Sujata Ghosh",
  "Sukanya Dutta", "Sunil Mukherjee", "Surabhi Bose", "Sushant Chatterjee", "Tejashree Khanna",
  "Trisha Das", "Trupti Pawar", "Umesh Shinde", "Upendra Gaikwad", "Urvashi Chowdary",
  "Varsha Anand", "Vasundhara Sethi", "Vidya Kulkarni", "Virendra Joshi", "Yogesh Iyer"
];

// Reference base date (October 2026)
const baseTime = new Date('2026-10-24T12:00:00Z').getTime();

export const SAMPLE_MEMBERS = rawNames.map((name, i) => {
  // Staggered join dates: 80 days ago to 3 days ago
  const daysAgo = 80 - Math.floor((i / rawNames.length) * 77);
  const hourOffset = (i % 24) * 3600 * 1000;
  const createdAt = new Date(baseTime - (daysAgo * 24 * 3600 * 1000) - hourOffset).toISOString();

  return {
    _id: `sample-member-${i + 1}`,
    name,
    role: 'user',
    createdAt,
  };
});
