/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

// Theme Colors
const themeColors = {
  primary: "#4C4C6D", // Dark Slate Blue
  secondary: "#282c34", // Dark Gray
  accent: "#F0A500", // Orange
  text: "#333", // Dark Gray
  link: "#c4a1a1", // Light Brown
};

const ErrorBase = styled.div`
  grid-column: 1 / 3;
  color: ${themeColors.accent};
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1em;
  border-radius: 8px;
  display: ${(props) => (props.hide ? "none" : "flex")};
  justify-content: center;
  align-items: center;
  min-height: 1.2em;
  font-weight: bold;
  box-shadow: 0 0 10px ${themeColors.accent};
  z-index: 10; /* Ensure it doesn’t overlap Landing.js elements */
`;

export const ErrorMessage = ({ msg = "", hide = false }) => {
  return <ErrorBase hide={hide}>{msg}</ErrorBase>;
};

ErrorMessage.propTypes = {
  msg: PropTypes.string,
  hide: PropTypes.bool,
};

const NotifyBase = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: ${(props) => (props.show ? "flex" : "none")}; /* Conditionally render */
  justify-content: center;
  align-items: center;
  font-family: 'Roboto', sans-serif;
  z-index: 20; /* High z-index for modal but below Landing.js overlay */
`;

const NotifyBox = styled.div`
  padding: 2em;
  border: 1px solid ${themeColors.text};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  color: ${themeColors.text};
  box-shadow: 0 0 20px ${themeColors.text};
`;

export const ModalNotify = ({ msg = "", onAccept, show = false }) => {
  return (
    <NotifyBase show={show}>
      <NotifyBox>
        <p>{msg}</p>
        {onAccept ? <FormButton onClick={onAccept}>Ok</FormButton> : null}
      </NotifyBox>
    </NotifyBase>
  );
};

ModalNotify.propTypes = {
  msg: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired,
  show: PropTypes.bool, // Added to control visibility
};

export const FormBase = styled.form`
  display: grid;
  grid-template-columns: 30% 70%;
  grid-auto-rows: minmax(10px, auto);
  padding: 1em;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  color: ${themeColors.text};
  font-family: 'Roboto', sans-serif;
`;

export const FormLabel = styled.label`
  padding: 0.5em 0.5em;
  text-align: right;
  font-weight: bold;
`;

export const FormInput = styled.input`
  margin: 0.5em 0;
  width: 75%;
  padding-left: 5px;
  background-color: #fff;
  border: 1px solid ${themeColors.text};
  border-radius: 8px;
  color: ${themeColors.text};
`;

export const FormButton = styled.button`
  max-width: 200px;
  min-width: 150px;
  max-height: 2em;
  background: linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary});
  border: none;
  border-radius: 8px;
  line-height: 2em;
  font-size: 0.8em;
  color: white;
  cursor: pointer;
  margin-top: 1em;
  transition: background-color 0.4s ease, box-shadow 0.4s ease;

  &:hover {
    background: ${themeColors.accent};
    box-shadow: 0 0 10px ${themeColors.accent};
  }
`;

export const FormSelect = styled.select`
  font-size: 1em;
  margin: 0.5em 0;
  width: 75%;
  padding-left: 5px;
  background-color: #fff;
  border: 1px solid ${themeColors.text};
  border-radius: 8px;
  color: ${themeColors.text};
`;

export const FormHeader = styled.h2`
  grid-column: 1 / 3;
  font-family: 'Roboto', sans-serif;
  color: ${themeColors.text};
  text-align: center;
  margin-bottom: 1em;
`;

export const InfoBlock = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas: "labels info";
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1em;
  border-radius: 16px;
  color: ${themeColors.text};
  font-family: 'Roboto', sans-serif;
`;

export const InfoData = styled.div`
  display: flex;
  flex-direction: column;
  & > p {
    margin: 0.5em 0.25em;
  }
`;

export const InfoLabels = styled(InfoData)`
  align-items: flex-end;
  font-weight: bold;
`;

export const ShortP = styled.p`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
