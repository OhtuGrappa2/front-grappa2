import { paths as nav } from './routes'

export const getPermissions = (role, context, method) => {
    if (!(role && context && method))
        return undefined;
    return permissions[role][context][method];
}

export const userRoles = ['admin', 'manager', 'print_person', 'resp_professor', 'grader', 'supervisor', 'student']

const permissions = {
    'admin': {
        'nav-bar': {
            show: [
                nav.home, nav.agreement, nav.theses, nav.supervisorManagement, nav.thesis, nav.assesment,
                nav.councilMeeting, nav.councilMeetings, nav.emailDrafts, nav.statistics, nav.notifications
            ]
        },
        'agreement': {
            'create': ['studentAddress', 'studentEmail', 'studentAddress', 'studentName', 'studentPhone', 'thesisCompletionEta', 'thesisWorkStudentTime', 'thesisWorkIntermediateGoal', 'thesisWorkMeetingAgreement', 'thesisWorkOther'],
            'edit': ['thesisCompletionEta', 'thesisWorkStudentTime', 'thesisWorkIntermediateGoal', 'thesisWorkMeetingAgreement', 'thesisSupervisorPrimary', 'thesisSupervisorSecond', 'thesisSupervisorOther', 'thesisWorkSupervisorTime', 'thesisWorkMeetingAgreement', 'thesisWorkOther']
        }
    },
    'manager': {
        'nav-bar': {
            show: [
                nav.home, nav.agreement, nav.theses, nav.supervisorManagement, nav.thesis, nav.assesment, nav.councilMeeting, nav.councilMeetings, nav.emailDrafts, nav.statistics
            ]
        },
        'agreement': {
            'create': ['studentAddress', 'studentEmail', 'studentAddress', 'studentName', 'studentPhone', 'thesisCompletionEta', 'thesisWorkStudentTime', 'thesisWorkIntermediateGoal', 'thesisWorkMeetingAgreement', 'thesisWorkOther'],
            'edit': ['thesisCompletionEta', 'thesisWorkStudentTime', 'thesisWorkIntermediateGoal', 'thesisWorkMeetingAgreement', 'thesisSupervisorPrimary', 'thesisSupervisorSecond', 'thesisSupervisorOther', 'thesisWorkSupervisorTime', 'thesisWorkMeetingAgreement', 'thesisWorkOther']
        }
    },
    'print_person': {
        'nav-bar': {
            show: [
                nav['home'], nav['agreement'], nav['theses'], nav['assesment']
            ]
        },
        'agreement': {
            'edit': ['thesisCompletionEta', 'thesisWorkStudentTime', 'thesisWorkIntermediateGoal', 'thesisWorkMeetingAgreement', 'thesisSupervisorSecond', 'thesisSupervisorOther', 'thesisWorkSupervisorTime', 'thesisWorkMeetingAgreement', 'thesisWorkOther']
        }
    },
    'resp_professor': {
        'nav-bar': {
            show: [
                nav['home'], nav['agreement'], nav['theses'], nav['supervisorManagement'], nav['assesment']
            ]
        }
    },
    'grader': {
        'nav-bar': {
            show: [
                nav['home'], nav['agreement'], nav['theses'], nav.thesis, nav['assesment']
            ]
        }
    },
    'supervisor': {
        'nav-bar': {
            show: [
                nav['home'], nav['agreement'], nav['theses'], nav.thesis, nav['assesment']
            ]
        }
    },
    'student': {
        'nav-bar': {
            show: [
                nav['home'], nav['agreement'], nav['assesment']
            ]
        },
        'agreement': {
            'create': ['studentAddress', 'studentEmail', 'studentAddress', 'studentName', 'studentPhone', 'thesisCompletionEta', 'thesisWorkStudentTime', 'thesisWorkIntermediateGoal', 'thesisWorkMeetingAgreement', 'thesisWorkOther'],
            'edit': ['thesisCompletionEta', 'thesisWorkStudentTime', 'thesisWorkIntermediateGoal', 'thesisWorkMeetingAgreement', 'thesisSupervisorPrimary', 'thesisSupervisorSecond', 'thesisSupervisorOther', 'thesisWorkSupervisorTime', 'thesisWorkMeetingAgreement', 'thesisWorkOther']
        }
    },
}
