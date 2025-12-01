import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResultItem from './ResultItem';
import '../styles/MainPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faSliders } from '@fortawesome/free-solid-svg-icons';
import { IoClose } from "react-icons/io5";
import resourceService from '../services/resourceService';
import trackService from '../services/trackService';
import { useUser } from '../contexts/userContext';

export default function MainPage() {
    const { user } = useUser();
    const location = useLocation();

    const [value, setValue] = useState(new URLSearchParams(location.search).get('value'));
    const [type, setType] = useState(new URLSearchParams(location.search).get('type'));

    // NEW STATES for Dropdown control
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");

    const [results, setResults] = useState([]);
    const [branches, setBranches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [popUpIsOpen, setPopUpIsOpen] = useState(false);
    const [popUpTitle, setpopUpTitle] = useState('Title')
    const [summary, setSummary] = useState('Backend Error!!')

    const year = new Date().getFullYear();
    const years = [];
    for (let i = year; i >= 2021; i--) {
        years.push(i + "-" + (i + 1));
    }

    const updateResults = async () => {
        try {
            const academicYear = selectedYear;
            const branch = selectedBranch;
            const course = selectedCourse;

            const category =
                value === "Mid Sem Papers" ? "midSem" :
                value === "End Sem Papers" ? "endSem" :
                value === "Projects" ? "project" : "research";

            const path = (category === "midSem" || category === "endSem")
                ? resourceService.getExam
                : resourceService.getCapstone;

            const response = await path(
                academicYear,
                branch,
                course,
                category,
                (type === 'manage' ? user.email : '')
            );

            setResults(response?.data?.results);
        } catch (err) {
            alert(err);
        }
    };

    const clearFilters = () => {
        setSelectedYear("");
        setSelectedBranch("");
        setSelectedCourse("");
        setResults([]);
    };

    const showPopUp = (t, s) => {
        setpopUpTitle("Summary for " + t);
        setSummary(s || "Please wait, summary is being generated");
        setPopUpIsOpen(true);
    };

    const closePopup = () => setPopUpIsOpen(false);

    useEffect(() => {
        setValue(new URLSearchParams(location.search).get('value'));
        setType(new URLSearchParams(location.search).get('type'));

        const getTracks = async () => {
            try {
                const response = await trackService.getBranches();
                setBranches(response.data.branches);

                const response2 = await trackService.getCourses();
                const sortedCourses = response2.data.courses.sort((a, b) => {
                    const nameA = a.course.substring(a.course.indexOf(' ') + 1);
                    const nameB = b.course.substring(b.course.indexOf(' ') + 1);
                    return nameA.localeCompare(nameB);
                });
                setCourses(sortedCourses);
            } catch (err) {
                console.log(err);
            }
        };

        getTracks();
        updateResults();
    }, [location]);

    useEffect(() => {
        updateResults();
    }, [selectedYear, selectedBranch, selectedCourse]);

    return (
        <div className="mainpage">
            {popUpIsOpen &&
                <div className="popUpLayout" onClick={closePopup}>
                    <div className="popUpBox" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closePopup} className="popUpClose">
                            <IoClose />
                        </button>
                        <h2 className="popUpTitle">{popUpTitle}</h2>
                        <p className="popUpSummary">{summary}</p>
                    </div>
                </div>
            }

            <div className="main-query">
                <div className="mainpage-heading">
                    <FontAwesomeIcon icon={faFileLines} /> {value}
                </div>
                <div className="mainpage-filter-txt">
                    <FontAwesomeIcon icon={faSliders} /> Filters
                </div>

                <div className="filter-group">
                    <div className="mainpage-filters-container">

                        {/* Academic Year */}
                        <div className="mainpage-year mainpage-filter-item">
                            <div className="filter-container">
                                <div className="filter-label">Academic Year</div>
                                <div className="filter-choice">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(e.target.value);
                                            setSelectedBranch("");
                                            setSelectedCourse("");
                                        }}
                                    >
                                        <option value="">Choose Academic Year</option>
                                        {years.map((year) => (
                                            <option value={year} key={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Branch */}
                        <div className="mainpage-branch mainpage-filter-item">
                            <div className="filter-container">
                                <div className="filter-label">Branch</div>
                                <div className="filter-choice">
                                    <select
                                        value={selectedBranch}
                                        disabled={!selectedYear}
                                        onChange={(e) => {
                                            setSelectedBranch(e.target.value);
                                            setSelectedCourse("");
                                        }}
                                    >
                                        <option value="">Choose Branch</option>
                                        {branches.map((branch) => (
                                            <option value={branch.branch} key={branch._id}>{branch.branch}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Course */}
                        <div className="mainpage-course mainpage-filter-item">
                            <div className="filter-container">
                                <div className="filter-label">Course</div>
                                <div className="filter-choice">
                                    <select
                                        value={selectedCourse}
                                        disabled={!selectedBranch}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                    >
                                        <option value="">Choose Course</option>
                                        {courses.map((course) => (
                                            <option value={course.course} key={course._id}>{course.course}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mainpage-apply-btn">
                        <button onClick={clearFilters}>Clear All</button>
                    </div>
                </div>
            </div>

            <div className="mainpage-results">
                <div className="mainpage-results-txt">Results</div>
                <div className="mainpage-result-container">
                    <div className="result-container">
                        {results.length === 0 ? (
                            <div className="no-results">No Results Found</div>
                        ) : (
                            results.map((resultItem, index) => (
                                <ResultItem
                                    key={index}
                                    resultItem={resultItem}
                                    index={index}
                                    type={type}
                                    showPopUp={showPopUp}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
