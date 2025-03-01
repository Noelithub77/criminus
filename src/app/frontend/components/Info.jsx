import { useState } from "react";
import "./Info.css";

const Info = () => {
  const [activeTab, setActiveTab] = useState("Violent");

  // Crime data organized by category
  const crimes = {
    Violent: [
      {
        id: 1,
        name: "Murder/Homicide",
        description: "The intentional killing of another person",
        ipcSection: "302",
        punishment: "Death or life imprisonment and fine",
      },
      {
        id: 2,
        name: "Assault",
        description: "Causing bodily harm to another person",
        ipcSection: "351",
        punishment: "3 months imprisonment or fine up to ₹500",
      },
      {
        id: 3,
        name: "Kidnapping",
        description: "Taking away a person against their will",
        ipcSection: "359-369",
        punishment: "Up to 7 years imprisonment and fine",
      },
      {
        id: 4,
        name: "Robbery",
        description: "Theft involving use of force",
        ipcSection: "390",
        punishment: "Rigorous imprisonment up to 10 years and fine",
      },
      {
        id: 5,
        name: "Rape",
        description: "Sexual assault without consent",
        ipcSection: "376",
        punishment: "Rigorous imprisonment of 10 years to life and fine",
      },
    ],
    Property: [
      {
        id: 1,
        name: "Theft",
        description: "Taking property without permission",
        ipcSection: "378",
        punishment: "Imprisonment up to 3 years or fine or both",
      },
      {
        id: 2,
        name: "Burglary",
        description: "Breaking into a building to commit a crime",
        ipcSection: "445",
        punishment: "Imprisonment up to 2 years and fine",
      },
      {
        id: 3,
        name: "Arson",
        description: "Deliberately setting fire to property",
        ipcSection: "435",
        punishment: "Imprisonment up to 7 years and fine",
      },
      {
        id: 4,
        name: "Vandalism",
        description: "Willful destruction of property",
        ipcSection: "425",
        punishment: "Imprisonment up to 3 months or fine or both",
      },
      {
        id: 5,
        name: "Fraud",
        description: "Deception for financial gain",
        ipcSection: "420",
        punishment: "Imprisonment up to 7 years and fine",
      },
    ],
    Financial: [
      {
        id: 1,
        name: "Money Laundering",
        description: "Concealing origins of illegally obtained money",
        ipcSection: "PMLA 2002",
        punishment: "Imprisonment from 3 to 7 years and fine up to ₹5 lakh",
      },
      {
        id: 2,
        name: "Tax Evasion",
        description: "Illegal avoidance of taxes",
        ipcSection: "276C of IT Act",
        punishment: "Imprisonment from 3 months to 2 years and fine",
      },
      {
        id: 3,
        name: "Embezzlement",
        description: "Theft of funds placed in one's trust",
        ipcSection: "409",
        punishment: "Imprisonment up to 10 years and fine",
      },
      {
        id: 4,
        name: "Bribery",
        description: "Offering money to influence actions",
        ipcSection: "171B",
        punishment: "Imprisonment up to 1 year or fine or both",
      },
      {
        id: 5,
        name: "Counterfeiting",
        description: "Creating fake currency or goods",
        ipcSection: "489A",
        punishment: "Imprisonment for life or up to 10 years and fine",
      },
    ],
    Cyber: [
      {
        id: 1,
        name: "Hacking",
        description: "Unauthorized access to computer systems",
        ipcSection: "66 IT Act",
        punishment: "Imprisonment up to 3 years or fine up to ₹5 lakh or both",
      },
      {
        id: 2,
        name: "Identity Theft",
        description: "Using others' personal data fraudulently",
        ipcSection: "66C IT Act",
        punishment: "Imprisonment up to 3 years and fine up to ₹1 lakh",
      },
      {
        id: 3,
        name: "Phishing",
        description: "Obtaining sensitive information through deception",
        ipcSection: "66D IT Act",
        punishment: "Imprisonment up to 3 years and fine up to ₹1 lakh",
      },
      {
        id: 4,
        name: "Cyberstalking",
        description: "Online harassment of an individual",
        ipcSection: "67 IT Act",
        punishment: "Imprisonment up to 3 years and fine up to ₹5 lakh",
      },
      {
        id: 5,
        name: "Data Breach",
        description: "Unauthorized access to confidential data",
        ipcSection: "43A IT Act",
        punishment: "Compensation as determined by adjudicating officer",
      },
    ],
    Juvenile: [
      {
        id: 1,
        name: "Underage Drinking",
        description: "Consumption of alcohol by minors",
        ipcSection: "JJ Act 2015",
        punishment: "Rehabilitation and counseling",
      },
      {
        id: 2,
        name: "Truancy",
        description: "Habitual absence from school",
        ipcSection: "RTE Act 2009",
        punishment: "Counseling and parental intervention",
      },
      {
        id: 3,
        name: "Vandalism by Minor",
        description: "Property damage caused by juveniles",
        ipcSection: "JJ Act 2015",
        punishment: "Community service and restitution",
      },
      {
        id: 4,
        name: "Minor Theft",
        description: "Stealing committed by juveniles",
        ipcSection: "JJ Act 2015",
        punishment: "Rehabilitation and probation",
      },
      {
        id: 5,
        name: "Juvenile Gang Activity",
        description: "Group delinquent behavior by minors",
        ipcSection: "JJ Act 2015",
        punishment: "Rehabilitation and monitoring",
      },
    ],
  };

  const [selectedCrime, setSelectedCrime] = useState(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedCrime(null);
  };

  const handleCrimeClick = (crime) => {
    setSelectedCrime(crime);
  };

  const handleBackClick = () => {
    setSelectedCrime(null);
  };

  return (
    <div className="info-page">
      <div className="info-header">
        <h2>Info</h2>
      </div>

      <div className="tab-container">
        {Object.keys(crimes).map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="crimes-container">
        {!selectedCrime ? (
          crimes[activeTab].map((crime) => (
            <div
              key={crime.id}
              className="crime-item"
              onClick={() => (crime.id <= 3 ? handleCrimeClick(crime) : null)}
            >
              <div className="crime-icon">
                {/* Simple icon representation */}
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    d="M12,2L1,21H23L12,2M12,6L19.53,19H4.47L12,6"
                    fill="#84a9c0"
                  />
                </svg>
              </div>
              <div className="crime-info">
                <h3>{crime.name}</h3>
                <p>{crime.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="crime-details">
            <button className="back-button" onClick={handleBackClick}>
              &larr; Back
            </button>
            <h2>{selectedCrime.name}</h2>
            <p>
              <strong>Description:</strong> {selectedCrime.description}
            </p>
            <p>
              <strong>IPC Section:</strong> {selectedCrime.ipcSection}
            </p>
            <p>
              <strong>Punishment:</strong> {selectedCrime.punishment}
            </p>
            <div className="additional-info">
              <h3>Legal Information</h3>
              <p>
                This crime is prosecuted under the Indian Penal Code or relevant
                acts as specified above. The severity of punishment may vary
                based on the circumstances and gravity of the offense.
              </p>
              <p>
                If you or someone you know has been accused of this crime, it is
                advisable to consult with a legal professional immediately.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Info;
