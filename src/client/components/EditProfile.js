// /* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

// Gradient animation for background
const gradientAnimation = keyframes`
  0% { background: #0d0d0d; }
  50% { background: #1a1a40; }
  100% { background: #0d0d0d; }
`;

// Main Container for the form
const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  animation: ${gradientAnimation} 10s infinite;
  padding: 1em;
  color: #f7ff00;
`;

// Form container
const FormContainer = styled.div`
  background-color: rgba(28, 28, 28, 0.95);
  padding: 2em;
  border-radius: 12px;
  box-shadow: 0 0 20px #005eff;
  border: 2px solid #9d00ff;
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

// Form Header with neon glow
const FormHeader = styled.h2`
  font-size: 1.8em;
  font-family: "Orbitron", sans-serif;
  color: #f7ff00;
  text-shadow: 0 0 8px #f7ff00, 0 0 15px #005eff;
  margin-bottom: 1em;
`;

const FormLabel = styled.label`
  font-size: 1.2em;
  color: #00ffff;
  margin-bottom: 0.5em;
  display: block;
  font-family: "Roboto Mono", monospace;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.8em;
  margin-bottom: 1em;
  font-size: 1em;
  font-family: "Roboto Mono", monospace;
  font-weight: bold;
  color: #f7ff00; 
  background-color: #1c1c1c;
  border: 2px solid #9d00ff;
  border-radius: 8px;
  box-shadow: 0 0 5px #9d00ff;
  outline: none;

  &:focus {
    border-color: #005eff;
    box-shadow: 0 0 10px #005eff;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    font-family: "Orbitron", sans-serif;
  }
`;

// Button with neon effects
const FormButton = styled.button`
  width: 100%;
  padding: 0.8em;
  margin-top: 0.5em;
  font-size: 1.2em;
  font-weight: bold;
  color: #000;
  background-color: #f7ff00;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 0 10px #f7ff00;

  &:hover {
    background-color: #00ffff;
    box-shadow: 0 0 15px #00ffff;
  }
`;

// Error message styled
const ErrorMessage = styled.p`
  color: #ff4040;
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 1em;
  text-shadow: 0 0 10px #ff4040, 0 0 20px #ff0000;
`;

// Notification modal for success or failure
const NotificationModal = styled.div`
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -20%);
  padding: 2em;
  background-color: #1c1c1c;
  color: ${(props) => (props.success ? "#00ff00" : "#ff4040")};
  border-radius: 12px;
  box-shadow: 0 0 20px ${(props) => (props.success ? "#00ff00" : "#ff4040")};
  z-index: 1000;
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
`;

const EditProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        primary_email: "",
        city: "",
        error: "",
    });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: "", success: true });

    useEffect(() => {
        fetch(`/v1/user/${username}`, { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch profile data.");
                return res.json();
            })
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching profile:", err);
                setProfile((prev) => ({
                    ...prev,
                    error: "Unable to fetch profile data.",
                }));
                setLoading(false);
            });
    }, [username]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!profile.primary_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.primary_email)) {
            setProfile((prev) => ({
                ...prev,
                error: "Please provide a valid email address.",
            }));
            return;
        }

        fetch(`/v1/user`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                first_name: profile.first_name,
                last_name: profile.last_name,
                city: profile.city,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to update profile.");
                return res.text();
            })
            .then(() => {
                setNotification({ message: "Profile updated successfully!", success: true });
                setTimeout(() => navigate(`/profile/${username}`), 2000);
            })
            .catch((err) => {
                console.error("Error updating profile:", err);
                setNotification({ message: "Failed to update profile. Please try again.", success: false });
            });
    };

    if (loading) {
        return <MainContainer>Loading...</MainContainer>;
    }

    return (
        <MainContainer>
            {notification.message && (
                <NotificationModal success={notification.success}>
                    {notification.message}
                </NotificationModal>
            )}
            <FormContainer>
                <FormHeader>Edit Profile</FormHeader>
                {profile.error && <ErrorMessage>{profile.error}</ErrorMessage>}
                <form onSubmit={handleSubmit}>
                    <FormLabel>First Name:</FormLabel>
                    <FormInput
                        type="text"
                        name="first_name"
                        value={profile.first_name}
                        onChange={handleChange}
                    />
                    <FormLabel>Last Name:</FormLabel>
                    <FormInput
                        type="text"
                        name="last_name"
                        value={profile.last_name}
                        onChange={handleChange}
                    />
                    <FormLabel>Email:</FormLabel>
                    <FormInput
                        type="email"
                        name="primary_email"
                        value={profile.primary_email}
                        disabled
                    />
                    <FormLabel>City:</FormLabel>
                    <FormInput
                        type="text"
                        name="city"
                        value={profile.city}
                        onChange={handleChange}
                    />
                    <FormButton type="submit">Save Changes</FormButton>
                </form>
            </FormContainer>
        </MainContainer>
    );
};

export default EditProfile;
