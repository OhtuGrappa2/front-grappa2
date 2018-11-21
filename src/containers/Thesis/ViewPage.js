import React, { Component } from 'react'
import { connect } from 'react-redux'
import { arrayOf, func, object } from 'prop-types'
import { Grid, GridColumn, GridRow, Form } from 'semantic-ui-react'
import moment from 'moment'
import {
    agreementType, attachmentType, councilmeetingType, personType, programmeType, studyfieldType, thesisType
} from '../../util/types'
import { createAttachment, deleteAttachment, downloadAttachments } from '../Attachment/services/attachmentActions'
import AttachmentList from '../Attachment/components/AttachmentList'
import { updateThesis } from './services/thesisActions'
import TextEdit from './components/edit/TextEdit'
import ThesisFieldEdit from './components/edit/ThesisFieldEdit'
import { getAgreements, saveStudyModuleRegistration } from '../Agreement/services/agreementActions'
import ThesisValueField from './components/edit/ThesisValueField'
import EditButton from './components/edit/EditButton'
import ThesisCouncilmeetingPicker from './components/ThesisCouncilmeetingPicker'
import AttachmentAdder from '../Attachment/components/AttachmentAdder'
import GraderSelector from './components/edit/GraderSelector'
import { combineAllThesisData } from '../../util/theses'
import GradeEdit from './components/edit/GradeEdit'
import { getGradersAction } from '../Person/services/personActions'

class ThesisViewPage extends Component {
    state = {
        value: '',
        open: '',
        newAttachments: [],
        programmeId: '',
        studyfieldId: '',
        grade: '',
        programmeGraders: [],
        graders: [],
        agreement: {
            requestStudyModuleRegistration: false
        }
    }

    componentDidMount() {
        this.updateState(this.props)
    }

    componentWillReceiveProps(newProps) {
        this.updateState(newProps)
    }

    updateState = (newProps) => {
        const thesisData = combineAllThesisData(Number(this.props.match.params.id), newProps)
        if (!thesisData.invalid) {
            this.setState(thesisData)
            getGradersAction(thesisData.programmeData.programme.programmeId)
                .then(res => this.setState({ programmeGraders: res.data }))
        }
    }

    toggleEditField = (fieldName) => {
        if (this.state.open === fieldName) {
            this.setState({ open: '' })
        } else {
            const value = this.state.thesis[fieldName]
            this.setState({ open: fieldName, value: value || '' })
        }
    }

    handleChange = event => this.setState({ value: event.target.value })

    changeProgramme = (event) => {
        this.setState({ programmeId: Number(event.target.value), studyfieldId: '' })
    }
    changeStudyfield = event => this.setState({ studyfieldId: Number(event.target.value) })
    changeGrade = event => this.setState({ grade: event.target.value })

    saveChanges = () => {
        const field = this.state.open
        const thesis = { thesisId: this.state.thesis.thesisId }

        thesis[field] = this.state.value
        this.props.saveThesis(thesis)
        this.setState({ open: '', value: '' })
    }

    saveStudyfieldAndGrade = () => {
        const thesis = {
            thesisId: this.state.thesis.thesisId,
            programmeId: this.state.programmeId,
            studyfieldId: this.state.studyfieldId,
            grade: this.state.grade
        }

        this.props.saveThesis(thesis)
        this.setState({ open: '', value: '' })
    }

    saveMeeting = (meeting) => {
        const councilmeetingId = Number(meeting.councilmeetingId)
        this.props.saveThesis({ thesisId: this.state.thesis.thesisId, councilmeetingId })
        this.setState({ open: '', value: '' })
    }

    updateGraders = (e, data) => this.setState({ graders: data.value })

    updateAttachments = attachments => this.setState({ newAttachments: attachments })

    uploadAttachments = () => {
        const form = new FormData()
        // agreementId needed to link the attachment to.
        const agreement = this.props.agreements.find(agreement => agreement.thesisId === this.state.thesis.thesisId)
        form.append('json', JSON.stringify(agreement))
        this.state.newAttachments.forEach((attachment) => {
            if (!attachment.label) {
                attachment.label = 'otherFile'
            }
            form.append(attachment.label, attachment)
        })

        this.props.createAttachment(form)
        this.setState({ open: '', newAttachments: [] })
    }

    saveGraders = () => {
        this.props.saveThesis({
            thesisId: this.state.thesis.thesisId,
            graders: this.state.graders
        })
        this.setState({ open: '', value: '' })
        this.props.getAgreements()
    }

    toggleGradeAndStudyfieldEdit = () => {
        this.setState({
            studyfieldId: this.state.programmeData.studyfield.studyfieldId,
            programmeId: this.state.programmeData.programme.programmeId,
            grade: this.state.thesis.grade
        })
        this.toggleEditField('grade')
    }

    requestStudyModuleRegistration = () => {
        const { agreement } = this.state
        this.props.updateStudyModuleRegistration(agreement.agreementId, agreement.requestStudyModuleRegistration)
    }

    handleRequestStudyModuleRegistrationCheck = () => {
        const { agreement } = this.state
        const { requestStudyModuleRegistration } = agreement

        this.setState({
            agreement: Object.assign(agreement, { requestStudyModuleRegistration: !requestStudyModuleRegistration })
        })
    }

    render() {
        const {
            thesis, agreement, authors, programmeData,
            councilMeeting, thesisAttachments, allowEdit
        } = this.state
        const meetingProgramme = councilMeeting ?
            this.props.programmes.find(programme => programme.programmeId === councilMeeting.programmes[0]) :
            undefined
        if (!thesis || !agreement) {
            return null
        }

        const { graders } = thesis
        const { requestStudyModuleRegistration } = agreement

        return (
            <Grid columns={4}>
                <GridRow>
                    <ThesisValueField title="Author">
                        {authors ? authors.map(author => (
                            author.firstname ? `${author.firstname} ${author.lastname}` : author.email
                        )) : 'NO AUTHORS'}
                    </ThesisValueField>
                </GridRow>
                <GridRow>
                    <ThesisValueField title="Thesis title">{thesis.title}</ThesisValueField>
                    <GridColumn width={8} />
                    <EditButton
                        toggle={() => this.toggleEditField('title')}
                        allowEdit={allowEdit}
                        save={this.saveChanges}
                        active={this.state.open === 'title'}
                    />
                    <TextEdit
                        active={this.state.open === 'title'}
                        value={this.state.value}
                        handleChange={this.handleChange}
                    />
                </GridRow>
                <GridRow>
                    <ThesisValueField title="Unit">{programmeData.programme.name}</ThesisValueField>
                    <ThesisValueField title="Studyfield">{programmeData.studyfield.name}</ThesisValueField>
                    <ThesisValueField title="Grade">{thesis.grade}</ThesisValueField>
                    <EditButton
                        toggle={this.toggleGradeAndStudyfieldEdit}
                        allowEdit={allowEdit}
                        active={this.state.open === 'grade'}
                        save={this.saveStudyfieldAndGrade}
                    />
                    <ThesisFieldEdit active={this.state.open === 'grade'}>
                        <GradeEdit
                            programmeId={this.state.programmeId}
                            studyfieldId={this.state.studyfieldId}
                            grade={this.state.grade}
                            programmes={this.props.programmes}
                            studyfields={this.props.studyfields}
                            programmeData={programmeData}
                            changeProgramme={this.changeProgramme}
                            changeStudyfield={this.changeStudyfield}
                            changeGrade={this.changeGrade}
                        />
                    </ThesisFieldEdit>
                </GridRow>
                <GridRow>
                    <ThesisValueField title="Graders">
                        {graders && graders.length > 0 ? graders.map(grader => (
                            grader.roleRequestId ?
                                <div key={grader.personId}>
                                    {grader.person.firstname} {grader.person.lastname} - GRADER NOT CONFIRMED
                                </div> :
                                <div key={grader.personId}>{grader.firstname} {grader.lastname}</div>
                        )) : <div>NO GRADERS</div>}
                    </ThesisValueField>
                    <GridColumn width={8} />
                    <EditButton
                        toggle={() => this.toggleEditField('graders')}
                        allowEdit={allowEdit}
                        active={this.state.open === 'graders'}
                        save={this.saveGraders}
                    />
                    <ThesisFieldEdit active={this.state.open === 'graders'}>
                        <GraderSelector
                            graders={this.state.graders}
                            validationErrors={{}}
                            allowEdit={allowEdit}
                            programmeGraders={this.state.programmeGraders}
                            change={this.updateGraders}
                        />
                    </ThesisFieldEdit>
                </GridRow>
                <GridRow>
                    <ThesisValueField title="Urkund link">
                        <a href={thesis.urkund} target="new">{thesis.urkund}</a>
                    </ThesisValueField>
                    <GridColumn width={8} />
                    <EditButton
                        toggle={() => this.toggleEditField('urkund')}
                        allowEdit={allowEdit}
                        active={this.state.open === 'urkund'}
                        save={this.saveChanges}
                    />
                    <TextEdit
                        active={this.state.open === 'urkund'}
                        value={this.state.value}
                        handleChange={this.handleChange}
                    />
                </GridRow>
                <GridRow>
                    <ThesisValueField title="Council meeting">
                        {councilMeeting && meetingProgramme ?
                            `${meetingProgramme.name} ${moment(councilMeeting.date).format('DD.MM.YYYY')}` :
                            'Not selected'}
                    </ThesisValueField>
                    <GridColumn width={8} />
                    <EditButton
                        toggle={() => this.toggleEditField('councilmeeting')}
                        allowEdit={allowEdit}
                        active={this.state.open === 'councilmeeting'}
                        noSave
                    />
                    <ThesisFieldEdit active={this.state.open === 'councilmeeting'}>
                        <ThesisCouncilmeetingPicker
                            councilmeetingId={councilMeeting ? councilMeeting.councilmeetingId : undefined}
                            programmeId={meetingProgramme ? meetingProgramme.programmeId : undefined}
                            councilmeetings={this.props.councilMeetings}
                            sendChange={this.saveMeeting}
                            programmes={this.props.programmes}
                        />
                    </ThesisFieldEdit>
                </GridRow>
                <GridRow>
                    <ThesisValueField title="Additional info">
                        {thesis.additionalInfo ? thesis.additionalInfo : ''}
                    </ThesisValueField>
                    <GridColumn width={8} />
                    <EditButton
                        toggle={() => this.toggleEditField('additionalInfo')}
                        allowEdit={allowEdit}
                        active={this.state.open === 'additionalInfo'}
                        save={this.saveChanges}
                    />
                    <ThesisFieldEdit active={this.state.open === 'additionalInfo'}>
                        <TextEdit
                            active={this.state.open === 'additionalInfo'}
                            value={this.state.value}
                            handleChange={this.handleChange}
                        />
                    </ThesisFieldEdit>
                </GridRow>
                <GridRow>
                    <GridColumn width={12}>
                        <h3 className="ui sub header">Attachments</h3>
                        <AttachmentList
                            downloadAttachment={this.props.downloadAttachments}
                            deleteAttachment={allowEdit ? this.props.deleteAttachment : null}
                            attachments={thesisAttachments}
                        />
                    </GridColumn>
                    <EditButton
                        toggle={() => this.toggleEditField('attachments')}
                        allowEdit={allowEdit}
                        active={this.state.open === 'attachments'}
                        noSave
                    />
                    <ThesisFieldEdit active={this.state.open === 'attachments'}>
                        <AttachmentAdder
                            attachments={this.state.newAttachments}
                            changeList={this.updateAttachments}
                            uploadAttachments={this.uploadAttachments}
                        />
                    </ThesisFieldEdit>
                </GridRow>
                <GridRow>
                    <GridColumn width={12}>
                        <Form>
                            <div className="ui sub header">
                                Do you want to send a study module registration request to head of studies?
                            </div>
                            <Form.Checkbox
                                label="Request study module registration"
                                checked={requestStudyModuleRegistration}
                                onClick={this.handleRequestStudyModuleRegistrationCheck}
                            />
                            <Form.Button onClick={this.requestStudyModuleRegistration}>
                                Send registration request
                            </Form.Button>
                        </Form>
                    </GridColumn>
                </GridRow>
            </Grid>
        )
    }
}

const mapStateToProps = state => ({
    user: state.user,
    theses: state.theses,
    agreements: state.agreements,
    // persons: state.persons,
    studyfields: state.studyfields,
    programmes: state.programmes,
    // roles: state.roles,
    councilMeetings: state.councilmeetings,
    attachments: state.attachments
})

const mapDispatchToProps = dispatch => ({
    downloadAttachments: attachmentId => dispatch(downloadAttachments([attachmentId])),
    saveThesis: thesis => dispatch(updateThesis(thesis)),
    getAgreements: () => dispatch(getAgreements()),
    createAttachment: attachment => dispatch(createAttachment(attachment)),
    deleteAttachment: attachmentId => dispatch(deleteAttachment(attachmentId)),
    updateStudyModuleRegistration: (agreementId, value) => dispatch(saveStudyModuleRegistration(agreementId, value))
})

ThesisViewPage.propTypes = {
    user: personType.isRequired,
    theses: arrayOf(thesisType).isRequired,
    agreements: arrayOf(agreementType).isRequired,
    // persons: arrayOf(personType).isRequired,
    studyfields: arrayOf(studyfieldType).isRequired,
    programmes: arrayOf(programmeType).isRequired,
    // roles: arrayOf(roleType).isRequired,
    councilMeetings: arrayOf(councilmeetingType).isRequired,
    attachments: arrayOf(attachmentType).isRequired,
    match: object.isRequired,
    downloadAttachments: func.isRequired,
    saveThesis: func.isRequired,
    getAgreements: func.isRequired,
    createAttachment: func.isRequired,
    deleteAttachment: func.isRequired,
    updateStudyModuleRegistration: func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(ThesisViewPage)
