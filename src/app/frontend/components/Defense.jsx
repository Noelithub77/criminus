import React, { useState } from "react";
import "./Defense.css";

// Main layout component
const Defense = () => {
  const [currentView, setCurrentView] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Function to navigate back to previous view
  const goBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
      setCurrentView("home");
    } else {
      setCurrentView("home");
    }
  };

  // Render the appropriate view based on navigation state
  const renderContent = () => {
    if (selectedSubcategory) {
      return <DetailView subcategory={selectedSubcategory} goBack={goBack} />;
    }

    if (selectedCategory) {
      return (
        <SubcategoryView
          category={selectedCategory}
          setSelectedSubcategory={setSelectedSubcategory}
          goBack={goBack}
        />
      );
    }

    return (
      <HomeView
        setSelectedCategory={setSelectedCategory}
        setCurrentView={setCurrentView}
      />
    );
  };

  return <div className="app-container">{renderContent()}</div>;
};

// Header component with user info and back button
const Header = ({ goBack, showBackButton }) => {
  return (
    <div className="header">
      {showBackButton && (
        <div className="back-container">
          <button className="back-button" onClick={goBack}>
            ←
          </button>
        </div>
      )}
    </div>
  );
};

// Home view with defense resource categories
const HomeView = ({ setSelectedCategory, setCurrentView }) => {
  return (
    <div className="content-container">
      <h2 className="section-title">Defense Resources</h2>
      <div className="resource-grid">
        <ResourceCard
          icon="📱"
          title="Emergency Contacts"
          description="Quick access to emergency services"
          onClick={() => setSelectedCategory("emergency")}
        />
        <ResourceCard
          icon="📧"
          title="Safety Guides"
          description="Practical guides to protect yourself"
          onClick={() => setSelectedCategory("safety")}
        />
        <ResourceCard
          icon="🛡️"
          title="Self Defense Tips"
          description="Learn basic self-defense techniques"
          onClick={() => setSelectedCategory("selfDefense")}
        />
      </div>
    </div>
  );
};

// Resource card component
const ResourceCard = ({ icon, title, description, onClick }) => {
  return (
    <div className="resource-card" onClick={onClick}>
      <div className="resource-icon">{icon}</div>
      <h3 className="resource-title">{title}</h3>
      <p className="resource-description">{description}</p>
    </div>
  );
};

// Subcategory view component
const SubcategoryView = ({ category, setSelectedSubcategory, goBack }) => {
  // Define subcategories based on the selected category
  const subcategories = {
    emergency: [
      {
        id: "police",
        title: "Police",
        description: "Emergency police contacts",
      },
      {
        id: "childLine",
        title: "Child Line",
        description: "Helpline for children in distress",
      },
      {
        id: "excise",
        title: "Excise",
        description: "Excise department contacts",
      },
      {
        id: "cyberCell",
        title: "Cyber Cell",
        description: "For reporting cyber crimes",
      },
      {
        id: "women",
        title: "Women",
        description: "Helpline for women in distress",
      },
    ],
    safety: [
      {
        id: "homeSafety",
        title: "Home Safety",
        description: "Securing your home",
      },
      {
        id: "travelSafety",
        title: "Travel Safety",
        description: "Staying safe while traveling",
      },
      {
        id: "digitalSafety",
        title: "Digital Safety",
        description: "Protecting your online presence",
      },
    ],
    selfDefense: [
      {
        id: "karate",
        title: "Karate",
        description: "Traditional Japanese martial art",
      },
      {
        id: "taekwondo",
        title: "Taekwondo",
        description: "Korean martial art emphasizing kicking",
      },
      {
        id: "kravMaga",
        title: "Krav Maga",
        description: "Military self-defense system",
      },
      {
        id: "basicTechniques",
        title: "Basic Techniques",
        description: "Simple self-defense moves",
      },
    ],
  };

  // Get the appropriate title for the current category
  const categoryTitles = {
    emergency: "Emergency Contacts",
    safety: "Safety Guides",
    selfDefense: "Self Defense Techniques",
  };

  // If emergency is selected, show the new emergency contacts UI
  if (category === "emergency") {
    return <EmergencyContactsView goBack={goBack} />;
  }

  return (
    <>
      <div className="title-bar">
        <button className="back-button" onClick={goBack}>
          ←
        </button>
        <h2>{categoryTitles[category]}</h2>
      </div>
      <div className="content-container">
        <div className="resource-grid">
          {subcategories[category].map((subcategory) => (
            <ResourceCard
              key={subcategory.id}
              icon="📄"
              title={subcategory.title}
              description={subcategory.description}
              onClick={() =>
                setSelectedSubcategory({ ...subcategory, category })
              }
            />
          ))}
        </div>
      </div>
    </>
  );
};

// New Emergency Contacts View
const EmergencyContactsView = ({ goBack }) => {
  const [activeTab, setActiveTab] = useState("police");

  const tabs = [
    { id: "police", label: "Police" },
    { id: "childLine", label: "Child Line" },
    { id: "excise", label: "Excise" },
    { id: "cyberCell", label: "Cyber Cell" },
    { id: "women", label: "Women" },
  ];

  const policeStations = [
    {
      name: "Kothamangalam Station",
      phone: "+91 9876543210",
    },
    {
      name: "Eranakulam SP",
      phone: "+91 9876543210",
    },
    {
      name: "Muvattupuzha Station",
      phone: "+91 9876543210",
    },
    {
      name: "Kottayam SP",
      phone: "+91 9876543210",
    },
    {
      name: "Calicut Station",
      phone: "+91 9876543210",
    },
    {
      name: "Malappuram Station",
      phone: "+91 9876543210",
    },
  ];

  // We'll just use police contacts for all tabs in this example
  const getContactsByTab = () => {
    return policeStations;
  };

  const contacts = getContactsByTab();

  return (
    <div className="emergency-contacts-view">
      <div className="title-bar">
        <button className="back-button" onClick={goBack}>
          ←
        </button>
        <h2>Emergency Contacts</h2>
      </div>

      <div className="emergency-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`emergency-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="contacts-list">
        {contacts.map((station, index) => (
          <div className="contact-item" key={index}>
            <div className="contact-icon">
              <div className="police-icon"></div>
            </div>
            <div className="contact-details">
              <div className="contact-name">{station.name}</div>
              <div className="contact-phone">{station.phone}</div>
            </div>
            <div className="contact-call-btn">
              <button className="call-button">
                <span className="call-icon"></span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Detail view component for specific subcategories
const DetailView = ({ subcategory, goBack }) => {
  // Content differs based on category and subcategory
  const renderDetailContent = () => {
    // Special case for self-defense techniques that need progress trackers
    if (subcategory.category === "selfDefense") {
      return <ProgressTracker technique={subcategory.id} />;
    }

    // For other categories, render information content
    return (
      <div className="detail-content">
        <p>Detailed information about {subcategory.title} goes here.</p>
        {subcategory.category === "emergency" && (
          <div className="emergency-contacts">
            <h4>Important Numbers</h4>
            <ul>
              <li>Emergency: 911</li>
              <li>Non-Emergency: 311</li>
              <li>Poison Control: 1-800-222-1222</li>
            </ul>
          </div>
        )}
        {subcategory.category === "safety" && (
          <div className="safety-tips">
            <h4>Key Safety Tips</h4>
            <ul>
              <li>Always be aware of your surroundings</li>
              <li>Keep emergency contacts readily available</li>
              <li>Plan escape routes and meeting points</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="title-bar">
        <button className="back-button" onClick={goBack}>
          ←
        </button>
        <h2>{subcategory.title}</h2>
      </div>
      <div className="content-container detail-view">
        {renderDetailContent()}
      </div>
    </>
  );
};

// Progress tracker component for self-defense techniques
const ProgressTracker = ({ technique }) => {
  // Sample progress data - in a real app this would be stored in state/database
  const progressData = {
    karate: [
      { day: 1, task: "Basic stance and balance", complete: true },
      { day: 2, task: "Front punch (Seiken)", complete: true },
      { day: 3, task: "Basic blocks (Age-uke, Soto-uke)", complete: false },
      { day: 4, task: "Front kick (Mae geri)", complete: false },
      { day: 5, task: "Combination techniques", complete: false },
      { day: 6, task: "Basic kata practice", complete: false },
      { day: 7, task: "Review and practice", complete: false },
    ],
    taekwondo: [
      { day: 1, task: "Horse stance and body positioning", complete: true },
      { day: 2, task: "Front kick (Ap chagi)", complete: false },
      { day: 3, task: "Roundhouse kick (Dollyo chagi)", complete: false },
      { day: 4, task: "Basic blocks and punches", complete: false },
      { day: 5, task: "Side kick (Yeop chagi)", complete: false },
      { day: 6, task: "Basic poomsae practice", complete: false },
      { day: 7, task: "Combinations and review", complete: false },
    ],
    kravMaga: [
      { day: 1, task: "Ready stance and movement", complete: false },
      { day: 2, task: "Straight punch defense", complete: false },
      { day: 3, task: "Choke defense (front)", complete: false },
      { day: 4, task: "Basic kicks and knee strikes", complete: false },
      { day: 5, task: "Wrist grab escapes", complete: false },
      { day: 6, task: "Bear hug defense", complete: false },
      { day: 7, task: "Pressure points and review", complete: false },
    ],
    basicTechniques: [
      { day: 1, task: "Awareness and avoidance strategies", complete: true },
      { day: 2, task: "Basic striking points", complete: false },
      { day: 3, task: "Wrist grab escapes", complete: false },
      { day: 4, task: "Simple blocking techniques", complete: false },
      { day: 5, task: "Using everyday objects for defense", complete: false },
      { day: 6, task: "De-escalation techniques", complete: false },
      { day: 7, task: "Scenario practice and review", complete: false },
    ],
  };

  // Title mapping for techniques
  const techniqueTitles = {
    karate: "Karate",
    taekwondo: "Taekwondo",
    kravMaga: "Krav Maga",
    basicTechniques: "Basic Self-Defense",
  };

  // Get progress data for the selected technique
  const tasks = progressData[technique] || [];

  return (
    <div className="progress-tracker">
      <h3>{techniqueTitles[technique]} - 7 Day Progress Plan</h3>
      <div className="progress-summary">
        <div className="progress-bar">
          <div
            className="progress-complete"
            style={{
              width: `${
                (tasks.filter((t) => t.complete).length / tasks.length) * 100
              }%`,
            }}
          ></div>
        </div>
        <span className="progress-text">
          {tasks.filter((t) => t.complete).length} of {tasks.length} tasks
          complete
        </span>
      </div>
      <div className="task-list">
        {tasks.map((task, index) => (
          <div
            key={index}
            className={`task-item ${task.complete ? "complete" : ""}`}
          >
            <div className="task-checkbox">{task.complete ? "✓" : "○"}</div>
            <div className="task-details">
              <span className="task-day">Day {task.day}</span>
              <span className="task-description">{task.task}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Defense;
