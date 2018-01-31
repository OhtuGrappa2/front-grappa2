import React, { Component } from 'react';
import PropTypes from 'prop-types';

import StudentInfoForm from './form/StudentInfoForm';
import ThesisInfoForm from './form/ThesisInfoForm';
import GoalInfoForm from './form/GoalInfoForm';
import AttachmentAdder from '../attachment/AttachmentAdder';
import { personType, programmeType } from '../../util/types';

export default class Agreement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: {
                thesisTitle: '',
                thesisStartDate: '',
                thesisCompletionEta: '',
                thesisPerformancePlace: '',

                thesisSupervisorMain: '',
                thesisSupervisorSecond: '',
                thesisSupervisorOther: '',

                thesisWorkStudentTime: '',
                thesisWorkSupervisorTime: '',
                thesisWorkIntermediateGoal: '',
                thesisWorkMeetingAgreement: '',
                thesisWorkOther: '',

                studentGradeGoal: '',
                programmeId: -1
            },
            attachments: [],
            filledRequiredFields: {}
        }
    }

    componentDidMount() {
        const fields = this.props.requiredFields.reduce((obj, value) => (Object.assign(obj, { [value]: false })), {});
        this.setState({ filledRequiredFields: fields });
    }

    handleFormChange = (event) => {
        const newForm = Object.assign({}, this.state.form);
        if (event.target) { // input field
            newForm[event.target.name] = event.target.value;
        } // else { //a file
        // newForm.attachments.push(event);
        // }
        this.setState({ form: newForm });
        this.validateData(event.target.name, event.target.value);
    }

    resetSupervisors = () => {
        const newForm = Object.assign({}, this.state.form);
        const fieldsCopy = Object.assign({}, this.state.filledRequiredFields);

        newForm.thesisSupervisorMain = '';
        newForm.thesisSupervisorSecond = '';

        if (fieldsCopy.thesisSupervisorMain !== undefined)
            fieldsCopy.thesisSupervisorMain = false;
        if (fieldsCopy.thesisSupervisorSecond !== undefined)
            fieldsCopy.thesisSupervisorSecond = false;
        this.setState({ form: newForm, filledRequiredFields: fieldsCopy });
    }

    validateData = (fieldName, value) => {
        if (this.state.filledRequiredFields[fieldName] !== undefined) {
            const fieldsCopy = Object.assign({}, this.state.filledRequiredFields);
            fieldsCopy[fieldName] = !(value === '' || value === -1);
            this.setState({ filledRequiredFields: fieldsCopy });
        }
    }

    addAttachment = (file) => {
        const newAttachments = this.state.attachments;
        newAttachments.push(file);
        this.setState({ attachments: newAttachments });
    }

    removeAttachment = (file) => {
        const newAttachments = this.state.attachments;
        const index = newAttachments.indexOf(file);
        newAttachments.splice(index, 1);
        this.setState({ attachments: newAttachments });
    }

    sendForm = (event) => {
        event.preventDefault();
        this.props.saveAgreement({ ...this.state.form, attachments: this.state.attachments });
        // this.props.saveAttachment(this.state.attachments, this.state.form);
    }

    sendFormDraft = (event) => {
        event.preventDefault();
        this.props.saveAgreementDraft({ ...this.state.form });
    }

    render() {
        // --TO DO--!: display users agreementDraft data here if user has created a draft!
        if (!this.props.user.firstname) {
            return (<div>Login to add agreement</div>);
        }
        let buttonDisabled;
        if (Object.keys(this.state.filledRequiredFields).length === 0) {
            buttonDisabled = false;
        } else {
            buttonDisabled = Object.values(this.state.filledRequiredFields).some(field => field === false);
        }
        return (
            <div>
                <h2>Gradusopimus tehdään gradunohjauksen alkaessa</h2>
                <p>Sopimusta voidaan muuttaa osapuolten yhteisestä päätöksestä.</p>
                <StudentInfoForm user={this.props.user} />
                <br />
                <ThesisInfoForm handleChange={this.handleFormChange} requiredFields={this.state.filledRequiredFields} />
                <br />
                <GoalInfoForm handleChange={this.handleFormChange} requiredFields={this.state.filledRequiredFields} />
                <br />
                <AttachmentAdder
                    attachments={this.state.attachments}
                    addAttachment={this.addAttachment}
                    removeAttachment={this.removeAttachment}
                />
                <br />
                <button className="green massive ui button" disabled={buttonDisabled} onClick={this.sendForm}>
                    {(buttonDisabled) ? 'Kaikkia pakollisia tietoja ei ole täytetty' : 'Save agreement'}
                </button>
                <button className="gray massive ui button" onClick={this.sendFormDraft}>
                    Save draft
                </button>
                <br />
            </div>

        );
    }

    /* SAVE FROM OLD BRANCH - AGREEMENT WIZARD BAR
    getWizardLine() {
        return (<div className="ui mini steps">
            <a className={"step " + (this.state.formSteps == 0 ? 'active' : (this.state.formSteps > 0 ? 'completed' : ''))} onClick={() => this.wizardOnClick(0)}>
                <i className="small address card outline icon"></i>
                <div className="content">
                    <div className="title">Personal Info</div>
                </div>
            </a>
            <a className={"step " + (this.state.formSteps == 1 ? 'active' : (this.state.formSteps > 1 ? 'completed' : ''))} onClick={() => this.wizardOnClick(1)}>
                <i className="small file text outline icon"></i>
                <div className="content">
                    <div className="title">Thesis</div>
                </div>
            </a>
            <a className={"step " + (this.state.formSteps == 2 ? 'active' : (this.state.formSteps > 2 ? 'completed' : ''))} onClick={() => this.wizardOnClick(2)}>
                <i className="small user icon"></i>
                <div className="content">
                    <div className="title">Supervisor</div>
                </div>
            </a>
            <a className={"step " + (this.state.formSteps == 3 ? 'active' : (this.state.formSteps > 3 ? 'completed' : ''))} onClick={() => this.wizardOnClick(3)}>
                <i className="small edit outline icon"></i>
                <div className="content">
                    <div className="title">Agreement</div>
                </div>
            </a>
            <a className={"step " + (this.state.formSteps == 4 ? 'active' : (this.state.formSteps > 4 ? 'completed' : ''))} onClick={() => this.wizardOnClick(4)}>
                <i className="small comments outline icon"></i>
                <div className="content">
                    <div className="title">Other</div>
                </div>
            </a>
            <a className={"step " + (this.state.formSteps == 5 ? 'active' : (this.state.formSteps > 5 ? 'completed' : ''))} onClick={() => this.wizardOnClick(5)}>
                <i className="small info icon"></i>
                <div className="content">
                    <div className="title">Confirm</div>

                </div>
            </a>
        </div>);
    }
    */
}

const { array, arrayOf, func } = PropTypes;
Agreement.propTypes = {
    user: personType.isRequired,
    requiredFields: array.isRequired,
    saveAgreement: func.isRequired,
    saveAgreementDraft: func.isRequired,
    programmes: arrayOf(programmeType).isRequired
};
