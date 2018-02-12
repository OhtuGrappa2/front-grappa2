import React, { Component } from 'react';
import { arrayOf, func, bool } from 'prop-types';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { saveThesis } from './thesisActions';
import { personType, roleType, programmeType, studyfieldType, councilmeetingType } from '../../util/types';

import ThesisConfirmModal from '../../components/thesis/ThesisConfirmModal';
import ThesisInformation from '../../components/thesis/ThesisInformation';
import AttachmentAdder from '../../components/attachment/AttachmentAdder';
import PersonSelector from '../../components/person/PersonSelector';
import ThesisCouncilmeetingPicker from '../../components/thesis/ThesisCouncilmeetingPicker';
import { emptyThesisData, thesisValidation } from '../../util/theses';

export class ThesisCreatePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            thesis: emptyThesisData,
            attachments: [],
            showModal: false,
            validationErrors: {}
        }
    }

    handleSaveThesis = () => {
        const form = new FormData();
        // TODO: If no review & thesis, then don't save
        this.state.attachments.forEach((attachment) => {
            if (!attachment.label) {
                attachment.label = 'otherFile';
            }
            form.append(attachment.label, attachment);
        });
        const thesis = Object.assign({}, this.state.thesis);
        delete thesis.programmeId;
        thesis.graders = thesis.graders.map(person => person.personId);
        form.append('json', JSON.stringify(thesis));
        this.props.saveThesis(form);
    };

    validateAttachments = attachments => attachments.find(attachment => attachment.label === 'thesisFile')
        && attachments.find(attachment => attachment.label === 'reviewFile');

    toggleModal = () => {
        this.validateThesis()
            .then(() => {
                if (this.validateAttachments(this.state.attachments)) {
                    this.setState({ showModal: !this.state.showModal })
                }
            })
            .catch(res => this.setState({ validationErrors: res.errors }));
    };

    handleChange = (changedValues) => {
        const thesis = Object.assign({}, this.state.thesis, changedValues);

        this.setState({ thesis });
        this.validateThesis(thesis)
            .then(() => this.setState({ validationErrors: {} }))
            .catch(res => this.setState({ validationErrors: res.errors }));
    };

    editAttachmentList = (attachments) => {
        this.setState({ attachments });
    };

    validateThesis(thesis = this.state.thesis) {
        return thesisValidation.run(thesis);
    }

    renderGraderSelecter() {
        const programmeGraders = this.props.persons.filter(person =>
            this.props.roles.find(role =>
                role.name === 'grader'
                && role.personId === person.personId
                && role.programmeId === parseInt(this.state.thesis.programmeId, 10)
            )
        );
        return (
            <div className="field">
                <label>
                    Select graders
                    <PersonSelector
                        persons={programmeGraders}
                        selected={this.state.thesis.graders}
                        changeList={list => this.handleChange({ graders: list })}
                        validationError={Object.keys(this.state.validationErrors).includes('graders')}
                    />
                </label>
            </div>
        );
    }

    render() {
        if (this.props.success && this.state.showModal) {
            return <Redirect to="/" />;
        }

        return (
            <div>
                <ThesisConfirmModal
                    sendSaveThesis={this.handleSaveThesis}
                    closeModal={this.toggleModal}
                    showModal={this.state.showModal}
                />
                <div className="ui form">
                    <ThesisInformation
                        sendChange={this.handleChange}
                        allowEdit
                        studyfields={this.props.studyfields}
                        programmes={this.props.programmes}
                        thesis={this.state.thesis}
                        validationErrors={this.state.validationErrors}
                    />
                    {this.renderGraderSelecter()}
                    <h2>Upload at least thesis file and the review file</h2>
                    <AttachmentAdder
                        attachments={this.state.attachments}
                        changeList={this.editAttachmentList}
                    />
                    <br />
                    <ThesisCouncilmeetingPicker
                        sendChange={this.handleChange}
                        chosenMeetingId={this.state.thesis.councilmeetingId}
                        councilmeetings={this.props.councilmeetings}
                        programmes={this.props.programmes}
                    />
                </div>
                <br />
                <button className="ui positive button" onClick={this.toggleModal}>
                    Submit
                </button>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    saveThesis(thesis) {
        dispatch(saveThesis(thesis));
    }
});

const mapStateToProps = state => ({
    councilmeetings: state.councilmeetings,
    programmes: state.programmes,
    studyfields: state.studyfields,
    roles: state.roles,
    persons: state.persons,
    success: state.eventMessage.saveThesis && state.eventMessage.saveThesis.active
});

ThesisCreatePage.propTypes = {
    councilmeetings: arrayOf(councilmeetingType).isRequired,
    programmes: arrayOf(programmeType).isRequired,
    studyfields: arrayOf(studyfieldType).isRequired,
    roles: arrayOf(roleType).isRequired,
    persons: arrayOf(personType).isRequired,
    saveThesis: func.isRequired,
    success: bool
};

ThesisCreatePage.defaultProps = {
    success: false
};

export default connect(mapStateToProps, mapDispatchToProps)(ThesisCreatePage);
