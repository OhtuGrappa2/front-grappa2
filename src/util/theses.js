import Checkit from 'checkit'
import moment from 'moment'

export const formatTheses = (theses, agreements, persons, roles = [], councilMeetings = []) => {
    if (theses.length === 0 || persons.length === 0 || agreements.length === 0)
        return []

    return theses.map(thesis => formatThesis(thesis, agreements, persons, roles, councilMeetings))
}

export const formatThesis = (thesis, agreements, persons, roles, councilMeetings) => {
    const formattedThesis = Object.assign({}, thesis)
    const thesisAgreement = agreements.find(agreement => agreement.thesisId === thesis.thesisId)
    const author = thesisAgreement ? persons.find(person => person.personId === thesisAgreement.authorId) : {}

    if (!thesisAgreement) {
        return formattedThesis
    }
    formattedThesis.studyfieldId = thesisAgreement.studyfieldId

    if (roles) {
        formattedThesis.graders = persons.filter(person =>
            roles.find(role =>
                role.personId === person.personId &&
                role.agreementId === thesisAgreement.agreementId
            )
        )

        formattedThesis.gradersApproved = roles
            .filter(role => thesisAgreement.agreementId === role.agreementId)
            .every(role => role.approved === true)
    }

    if (author) {
        formattedThesis.authorEmail = author.email
        formattedThesis.authorFirstname = author.firstname
        formattedThesis.authorLastname = author.lastname
    } else { // Thesis not linked to person yet, use invite link email
        formattedThesis.authorEmail = thesisAgreement.email
    }

    if (formattedThesis.councilmeetingId) {
        const councilMeeting = councilMeetings
            .find(meeting => meeting.councilmeetingId === formattedThesis.councilmeetingId)

        if (councilMeeting)
            formattedThesis.councilMeeting = moment(councilMeeting.date).format('DD.MM.YYYY')
    }

    return formattedThesis
}

export const combineAllThesisData = (thesisId, props) => {
    const { theses, studyfields, programmes, councilMeetings, attachments, user, agreements } = props

    const editRoles = ['manager', 'admin']
    const hasAllDataLoaded = [
        theses, studyfields, programmes, councilMeetings, agreements
    ].every(arr => arr.length > 0)

    if (!hasAllDataLoaded) {
        return { invalid: true }
    }

    const selectedId = Number(thesisId)
    const thesis = theses.find(t => t.thesisId === selectedId)
    const agreement = agreements.find(agr => agr.agreementId === thesis.agreements[0].agreementId)
    const { authors } = thesis

    if (!agreement || !authors) {
        return { invalid: true }
    }
    const studyfield = studyfields.find(field => field.studyfieldId === agreement.studyfieldId)
    const programme = programmes.find(prg => prg.programmeId === studyfield.programmeId)
    const programmeData = { studyfield, programme }
    const graders = thesis.graders.map(grader => grader.personId)
    const councilMeeting = councilMeetings
        .find(meeting => meeting.councilmeetingId === thesis.councilmeetingId)
    const thesisAttachments = attachments.filter(attachment => attachment.agreementId === agreement.agreementId)
    const allowEdit = !!user.roles.find(role => editRoles.includes(role.role))

    return { thesis, agreement, authors, programmeData, graders, councilMeeting, thesisAttachments, allowEdit }
}


export const oldGradeFields = [
    { id: 'Approbatur', name: 'Approbatur' },
    { id: 'Lubenter Approbatur', name: 'Lubenter Approbatur' },
    { id: 'Non Sine Laude Approbatur', name: 'Non Sine Laude Approbatur' },
    { id: 'Cum Laude Approbatur', name: 'Cum Laude Approbatur' },
    { id: 'Magna Cum Laude Approbatur', name: 'Magna Cum Laude Approbatur' },
    { id: 'Eximia Cum Laude Approbatur', name: 'Eximia Cum Laude Approbatur' },
    { id: 'Laudatur', name: 'Laudatur' }
]

export const gradeFields = [
    { id: '1', name: '1' },
    { id: '2', name: '2' },
    { id: '3', name: '3' },
    { id: '4', name: '4' },
    { id: '5', name: '5' }
]

export const thesisValidationRules = {
    title: 'required',
    authorEmail: ['required', 'email'],
    urkund: ['required', 'url'],
    grade: 'required',
    programmeId: 'required',
    studyfieldId: 'required',
    graders: ['minLength:2']
}

export const thesisValidation = new Checkit(thesisValidationRules)

export const emptyThesisData = {
    id: undefined,
    authorFirstname: '',
    authorLastname: '',
    authorEmail: '',
    title: '',
    urkund: 'https://',
    grade: '',
    graders: [],
    programmeId: undefined,
    councilmeetingId: undefined,
    printDone: undefined,
    thesisEmails: {
        graderEvalReminder: undefined,
        printReminder: undefined
    }
}

export const labelToText = (label) => {
    switch (label) {
        case 'otherFile':
            return 'Other'
        case 'reviewFile':
            return 'Review'
        case 'thesisFile':
            return 'Thesis'
        default:
            return 'Label not handled'
    }
}
