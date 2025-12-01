import React, { useState, useEffect } from "react";
import resourceService from "../services/resourceService";
import "../styles/ContributePage.css";
import trackService from "../services/trackService";
import { useUser } from "../contexts/userContext";
import aiService from "../services/aiService";

export default function Contribute() {
  const { user } = useUser();

  const [emailValid, setEmailValid] = useState(false);

  const [data, setData] = useState({
    title: "",
    url: "",
    category: "",
    academicYear: "",
    branch: "",
    course: "",
    pdfFile: null,
    author: "",
  });

  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);

  const [choice, setChoice] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Year List
  const year = new Date().getFullYear();
  const years = [];
  for (let i = year; i >= 2021; i--) {
    years.push(i + "-" + (i + 1));
  }

  useEffect(() => {
    if (user && user.email) {
      setData((prev) => ({ ...prev, author: user.email }));
      setEmailValid(true);
    }
  }, [user]);

  useEffect(() => {
    const getTracks = async () => {
      try {
        const response = await trackService.getBranches();
        setBranches(response.data.branches);

        const res2 = await trackService.getCourses();
        setCourses(res2.data.courses);
      } catch (err) {
        console.log(err);
      }
    };
    getTracks();
  }, []);


  // Form Fields Update
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });

    if (name === "academicYear") {
      setData({
        ...data,
        academicYear: value,
        branch: "",
        course: ""
      });
    }

    if (name === "branch") {
      setData({
        ...data,
        branch: value,
        course: ""
      });
    }
  };

  const handleFileChange = (e) => {
    setData({ ...data, pdfFile: e.target.files[0] });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("category", data.category);
    formData.append("academicYear", data.academicYear);
    formData.append("branch", data.branch);
    formData.append("course", data.course);
    formData.append("url", data.url);
    formData.append("pdfFile", data.pdfFile);
    formData.append("author", data.author);

    try {
      const method =
        choice === "capstone"
          ? resourceService.addCapstone
          : resourceService.addExam;

      const res = await method(formData);

      setMessage(res.data.message);
      setSuccess(res.data.success);

      if (data.category === "research") {
        const rawUrl = await resourceService.getRawUrl(data.url);
        aiService.generateSummaryAndUpdateDB(data.title, rawUrl, res.data.id);
      }

      if (res.data.success) {
        setTimeout(() => {
          setMessage("Resource added successfully");
          setData({
            title: "",
            url: "",
            category: "",
            academicYear: "",
            branch: "",
            course: "",
            pdfFile: null,
            author: user.email,
          });
          setChoice("");
        }, 2000);
      }
    } catch (err) {
      setMessage("Error submitting resource");
      setSuccess(false);
    } finally {
      setTimeout(() => setMessage(""), 5000);
    }
  };


  return (
    <div className="contributepage">
      {emailValid ? (
        <div className="contribute-container">
          <div className="contribute-header">Contribute Resource</div>

          <div className="contribute-content filter-choice">
            <label className="contributequestion">
              What would you like to contribute today?
            </label>
            <select
              id="contribution"
              className="contribution-choice"
              value={choice}
              onChange={(e) => setChoice(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="capstone">Capstone</option>
              <option value="exam">Sem Papers</option>
            </select>
          </div>

          <form id="contribution-form" onSubmit={handleSubmit}>

            {/* Academic Year */}
            <label className="contributefields">Year:</label>
            <select
              name="academicYear"
              required
              value={data.academicYear}
              onChange={handleChange}
            >
              <option value="">Choose Academic Year</option>
              {years.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            {/* Branch */}
            <label className="contributefields">Branch:</label>
            <select
              name="branch"
              required
              disabled={!data.academicYear}
              value={data.branch}
              onChange={handleChange}
            >
              <option value="">Choose Branch</option>
              {branches.map((br) => (
                <option key={br._id} value={br.branch}>{br.branch}</option>
              ))}
            </select>

            {/* Course */}
            <label className="contributefields">Course:</label>
            <select
              name="course"
              required
              disabled={!data.branch}
              value={data.course}
              onChange={handleChange}
            >
              <option value="">Choose Course</option>
              {courses.map((crs) => (
                <option key={crs._id} value={crs.course}>{crs.course}</option>
              ))}
            </select>


            {/* Capstone Section */}
            {choice === "capstone" && (
              <>
                <label className="contributefields">Category:</label>
                <select
                  required
                  name="category"
                  value={data.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="project">Project</option>
                  <option value="research">Research</option>
                </select>

                {data.category !== "" && (
                  <>
                    <label className="contributefields">Title:</label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder={data.category === "research"
                        ? "Enter title of research paper"
                        : "Enter title of your project"}
                      value={data.title}
                      onChange={handleChange}
                    />

                    <label className="contributefields">Link:</label>
                    <input
                      type="text"
                      name="url"
                      required
                      placeholder="Paste GitHub URL"
                      value={data.url}
                      onChange={handleChange}
                    />
                  </>
                )}
              </>
            )}

            {/* Exam Papers Section */}
            {choice === "exam" && (
              <>
                <label className="contributefields">Category:</label>
                <select
                  required
                  name="category"
                  value={data.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="midSem">Mid Sem</option>
                  <option value="endSem">End Sem</option>
                </select>

                <label className="contributefields">Upload File:</label>
                <input
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </>
            )}

            {message && (
              <div className={`login-response-msg ${success}`}>
                {message}
              </div>
            )}

            {choice !== "" && (
              <div className="contribution-btn-container">
                <button className="atlas-btn" type="submit">
                  Submit
                </button>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="contribute-container">
          <div className="contribute-header">Contribute Resource</div>
          <div className="contribute-message">
            Please login with your KIET email to contribute resources.
          </div>
        </div>
      )}
    </div>
  );
}
