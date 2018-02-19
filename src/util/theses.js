import Checkit from 'checkit'

export const formatTheses = (theses, agreements, persons, roles) => {
    if (!theses || !persons || !agreements)
        return []

    return theses.map(thesis => formatThesis(thesis, agreements, persons, roles))
}

export const formatThesis = (thesis, agreements, persons, roles) => {
    const thesisAgreement = agreements.find(agreement => agreement.thesisId === thesis.thesisId)
    const author = thesisAgreement ? persons.find(person => person.personId === thesisAgreement.authorId) : {}
    const formattedThesis = Object.assign({}, thesis)
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
    }

    if (author) {
        formattedThesis.authorEmail = author.email
        formattedThesis.authorFirstname = author.firstname
        formattedThesis.authorLastname = author.lastname
    } else { // Thesis not linked to person yet, use invite link email
        formattedThesis.authorEmail = thesisAgreement.email
    }

    return formattedThesis
}

export const combineAllThesisData = (thesisId, props) => {
    const { theses, agreements, persons, studyfields, programmes, roles, councilMeetings, attachments, user } = props

    const editRoles = ['manager', 'admin']
    const hasAllDataLoaded = [
        theses, agreements, persons, studyfields, programmes, roles, councilMeetings
    ].every(arr => arr.length > 0)

    if (!hasAllDataLoaded)
        return { invalid: true }

    const selectedId = Number(thesisId)
    const thesis = theses.find(t => t.thesisId === selectedId)
    const agreement = agreements.find(agr => agr.thesisId === selectedId)
    const author = (agreement) ? persons.find(person => person.personId === agreement.authorId) : null
    const studyfield = studyfields.find(field => field.studyfieldId === agreement.studyfieldId)
    const programme = programmes.find(prg => prg.programmeId === studyfield.programmeId)
    const programmeData = { studyfield, programme }
    const graders = roles
        .filter(role => role.agreementId === agreement.agreementId)
        .map(role => persons.find(person => person.personId === role.personId))
    const councilMeeting = councilMeetings
        .find(meeting => meeting.councilmeetingId === thesis.councilmeetingId)
    const thesisAttachments = attachments.filter(attachment => attachment.agreementId === agreement.agreementId)
    const allowEdit = !!user.roles.find(role => editRoles.includes(role.role))

    return { thesis, agreement, author, programmeData, graders, councilMeeting, thesisAttachments, allowEdit }
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
    urkund: 'http://',
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
