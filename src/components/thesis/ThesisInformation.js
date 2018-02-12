import React, { Component } from 'react';
import { arrayOf, bool, func, object } from 'prop-types';

import { oldGradeFields, gradeFields } from '../../util/theses';
import { thesisType, programmeType, studyfieldType } from '../../util/types';

export default class ThesisInformation extends Component {
    constructor() {
        super();
        this.state = {
            oldGrading: false
        }
    }

    componentWillReceiveProps(props) {
        const selectedProgrammeId = props.studyfields
            .find(studyfield => studyfield.programmeId === props.thesis.studyfieldId);

        if (selectedProgrammeId)
            props.thesis.programmeId = selectedProgrammeId.programmeId;
    }

    changeField = fieldName => (event) => {
        this.props.sendChange({[fieldName]: event.target.value});
    };

    toggleGrading = () => {
        this.props.sendChange({
            programmeId: "",
            studyfieldId: "",
            grade: ""
        })
        this.setState({ oldGrading: !this.state.oldGrading })
    }

    renderTextField(label, fieldName, placeholder, disabled, type = 'text') {
        const className = this.props.validationErrors[fieldName] ? 'field error' : 'field';
        const inputId = `${fieldName}-field`;

        return (
            <div className={className}>
                <label htmlFor={inputId}>
                    {label}
                    <input
                        id={inputId}
                        type={type}
                        name={fieldName}
                        disabled={disabled ? 'true' : ''}
                        value={this.props.thesis[fieldName]}
                        onChange={this.changeField(fieldName)}
                        placeholder={placeholder}
                    />
                </label>
            </div>
        );
    }

    renderDropdownField(label, fieldArray, fieldName, disabled) {
        const className = this.props.validationErrors[fieldName] ? 'field error' : 'field';
        const inputId = `${fieldName}-field`;

        return (
            <div className={className}>
                <label htmlFor={inputId}>
                    {label}
                    <select
                        id={inputId}
                        className="ui fluid search dropdown"
                        disabled={disabled ? 'true' : ''}
                        value={this.props.thesis[fieldName]}
                        onChange={this.changeField(fieldName)}
                    >
                        <option key="0" value="">Select {label}</option>
                        {fieldArray.map(field => (
                            <option key={field.id} value={field.id}>
                                {field.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        );
    }

    renderToggleUnitsAndGradingButton() {
        return (
            <button
                className="ui button"
                onClick={this.toggleGrading}
                disabled={!this.props.allowEdit}
            >
                {this.state.oldGrading ?
                    'Enable new grading' : 'Enable old grading'}
            </button>
        )
    }

    renderThesisAuthor() {
        if (!this.props.thesis.authorFirstname) {
            return (
                <div className="three fields">
                    {this.renderTextField('Email', 'authorEmail', 'Email Address', false, 'email')}
                </div>
            );
        }

        return (
            <div className="three fields">
                {this.renderTextField('Email', 'authorEmail', 'Email Address', true, 'email')}
                {this.renderTextField('First name', 'authorFirstname', 'Email Address', true, 'email')}
                {this.renderTextField('Last name', 'authorLastname', 'Email Address', true, 'email')}
            </div>
        );
    }

    renderThesisInformation() {
        const programmes = this.props.programmes
            .filter(programme => (
                programme.name.includes('Department') === this.state.oldGrading
            ))
            .map(programme => ({
                id: programme.programmeId,
                name: programme.name
            }))

        const studyfields = this.props.studyfields
            .filter(studyfield => studyfield.programmeId === Number(this.props.thesis.programmeId))
            .map(studyfield => ({
                id: studyfield.studyfieldId,
                name: studyfield.name
            }));

        return (
            <div className="ui form">
                <div className="three fields">
                    {this.renderTextField('Title', 'title', 'Title', !this.props.allowEdit)}
                    {this.renderTextField('Urkund-link', 'urkund', 'Link to Urkund', !this.props.allowEdit)}
                    <div className="field">
                        <label>&nbsp;   </label>
                        {this.renderToggleUnitsAndGradingButton()}
                    </div>
                </div>
                <div className="three fields">
                    {this.renderDropdownField('Unit', programmes, 'programmeId', !this.props.allowEdit)}
                    <div className="field">
                        {this.renderDropdownField('Studyfield', studyfields, 'studyfieldId', !this.props.allowEdit)}
                    </div>
                    {this.state.oldGrading ?
                        this.renderDropdownField('Grade', oldGradeFields, 'grade', !this.props.allowEdit) :
                        this.renderDropdownField('Grade', gradeFields, 'grade', !this.props.allowEdit)
                    }

                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                <h3 className="ui dividing header">Thesis Author</h3>
                {this.renderThesisAuthor()}
                <h3 className="ui dividing header">Thesis Information</h3>
                {this.renderThesisInformation()}
            </div>
        );
    }
}

ThesisInformation.propTypes = {
    sendChange: func.isRequired,
    thesis: thesisType.isRequired,
    programmes: arrayOf(programmeType).isRequired,
    studyfields: arrayOf(studyfieldType).isRequired,
    allowEdit: bool.isRequired,
    validationErrors: object.isRequired
};
