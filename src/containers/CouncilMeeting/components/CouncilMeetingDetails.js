import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Segment, Form, Button, Dropdown, Radio, Input } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'
import { arrayOf, func, bool } from 'prop-types'

import { makeAndGetProgrammesForDropdown } from '../../../selectors/programmes'
import { councilmeetingType, programmeType } from '../../../util/types'
import {
    daysBetween,
    DISPLAY_DATE_FORMAT,
    formatDisplayDate,
    isInDisplayDateFormat,
    momentFromDisplayFormat } from '../../../util/common'
import { saveCouncilmeeting, updateCouncilmeeting } from '../services/councilmeetingActions'

const INSTRUCTOR_DAYS_DEFAULT = 8
const STUDENT_DAYS_DEFAULT = 6

class CouncilMeetingDetails extends Component {
  static propTypes = {
      saveCouncilMeeting: func.isRequired,
      updateCouncilMeeting: func.isRequired,
      programmes: arrayOf(programmeType).isRequired,
      closeRowFn: func.isRequired,
      meeting: councilmeetingType,
      newMeeting: bool


  }
  static defaultProps = {
      meeting: {
          programmes: []
      },
      newMeeting: false
  }
  state = {
      meetingLocal: {},
      useOldUnits: false,
      instructorDays: INSTRUCTOR_DAYS_DEFAULT,
      studentDays: STUDENT_DAYS_DEFAULT,
      invalidDate: false
  }

  componentDidMount() {
      this.handleUpdate(this.props)
  }

  componentWillReceiveProps(nextProps) {
      this.handleUpdate(nextProps)
  }

  handleUpdate = (props) => {
      const { meeting, newMeeting } = props
      if (newMeeting) {
          this.setState({ meetingLocal: {} },
              () => this.handleMeetingDateChange())
      } else {
          const { date, instructorDeadline, studentDeadline } = meeting
          this.setState({
              instructorDays: daysBetween(date, instructorDeadline),
              studentDays: daysBetween(date, studentDeadline),
              meetingLocal: {
                  ...meeting,
                  programmes: meeting.programmes.map(p => p.programmeId)
              }
          })
      }
  }
  // react-datepicker doesnt trigger onChange on manual input
  handleMeetingDateChangeRaw = (e) => {
      const { value } = e.target
      const isDateValid = !isInDisplayDateFormat(value) || momentFromDisplayFormat(value).isBefore(moment(), 'days')
      this.setState({ invalidDate: isDateValid })
      if (isDateValid) {
          this.handleMeetingDateChange(momentFromDisplayFormat(value))
      }
  }

  handleMeetingDateChange = (d = moment()) => {
      const { meetingLocal, instructorDays, studentDays } = this.state
      const date = d
      const instructorDeadline = moment(d).subtract(instructorDays, 'days')
      const studentDeadline = moment(d).subtract(studentDays, 'days')

      this.setState({ meetingLocal: { ...meetingLocal, date, instructorDeadline, studentDeadline } })
  }

  handleInstructorDeadline = (e, { value = INSTRUCTOR_DAYS_DEFAULT }) => {
      const { meetingLocal } = this.state
      const instructorDeadline = moment(meetingLocal.date).subtract(value, 'days')
      this.setState({ instructorDays: value, meetingLocal: { ...meetingLocal, instructorDeadline } })
  }

  handleStudentDeadline = (e, { value = STUDENT_DAYS_DEFAULT }) => {
      const { meetingLocal } = this.state
      const studentDeadline = moment(meetingLocal.date).subtract(value, 'days')
      this.setState({ studentDays: value, meetingLocal: { ...meetingLocal, studentDeadline } })
  }

  handleUseOldUnitsChange = () => this.setState({ useOldUnits: !this.state.useOldUnits })

  handleUnitSelectChange = (e, { value }) => {
      const { meetingLocal } = this.state
      this.setState({ meetingLocal: {
          ...meetingLocal,
          programmes: value
      } })
  }

  handleSaveOrUpdateMeeting = () => {
      const { meetingLocal } = this.state
      const { newMeeting, saveCouncilMeeting, updateCouncilMeeting, closeRowFn } = this.props
      if (newMeeting) {
          saveCouncilMeeting(meetingLocal)
      } else {
          updateCouncilMeeting(meetingLocal)
      }
      this.setState({ meetingLocal: {} })
      closeRowFn()
  }

  renderDateInputGroup = () => {
      const { instructorDays, studentDays, meetingLocal, invalidDate } = this.state
      const { date, instructorDeadline, studentDeadline } = meetingLocal
      const numberInputStyle = { width: '65px' }

      return (
          <Form.Group widths="equal">
              <Form.Input
                  error={invalidDate}
                  control={DatePicker}
                  placeholderText="dd.mm.yyyy"
                  dateFormat={DISPLAY_DATE_FORMAT}
                  selected={moment(date)}
                  minDate={moment()}
                  fluid
                  label="Date"
                  onChange={d => this.handleMeetingDateChange(d)}
                  onChangeRaw={e => this.handleMeetingDateChangeRaw(e)}
              />
              <Form.Field>
                  <label>Instructor deadline</label>
                  <Input
                      label={formatDisplayDate(instructorDeadline)}
                      type="number"
                      value={instructorDays}
                      onChange={this.handleInstructorDeadline}
                      style={numberInputStyle}

                  />
              </Form.Field>
              <Form.Field>
                  <label>Student deadline</label>
                  <Input
                      label={formatDisplayDate(studentDeadline)}
                      type="number"
                      value={studentDays}
                      onChange={this.handleStudentDeadline}
                      style={numberInputStyle}
                  />
              </Form.Field>
          </Form.Group>
      )
  }

  renderProgrammeSelectGroup = () => {
      const { programmes } = this.props
      const { useOldUnits, meetingLocal } = this.state

      const programs = useOldUnits ?
          programmes.filter(p => p.text.includes('Department')) :
          programmes

      const selectedPrograms = meetingLocal.programmes || []

      return (
          <Form.Group>
              <Form.Field width="8">
                  <label>Units</label>
                  <Dropdown
                      placeholder="Select units"
                      multiple
                      search
                      fluid
                      selection
                      noResultsMessage="No units found."
                      value={selectedPrograms}
                      options={programs}
                      onChange={this.handleUnitSelectChange}
                      closeOnChange
                  />
              </Form.Field>
              <Form.Field>
                  <label>Use old units</label>
                  <Radio
                      toggle
                      style={{ marginTop: '10px' }}
                      label={useOldUnits ? 'On' : 'Off'}
                      checked={useOldUnits}
                      onChange={this.handleUseOldUnitsChange}
                  />
              </Form.Field>
          </Form.Group>
      )
  }

  render() {
      const { closeRowFn, newMeeting } = this.props
      const { invalidDate } = this.state
      return (
          <Segment attached color="grey" style={{ minWidth: '800px' }} >
              <Form className="attached fluid">
                  { this.renderDateInputGroup() }
                  { this.renderProgrammeSelectGroup() }
                  <Button
                      disabled={invalidDate}
                      color="green"
                      content={newMeeting ? 'Save new meeting' : 'Update meeting'}
                      onClick={this.handleSaveOrUpdateMeeting}
                  />
                  <Button
                      neutral="true"
                      content="Cancel"
                      onClick={closeRowFn}
                      style={{ marginLeft: '10px' }}
                  />
              </Form>
          </Segment>
      )
  }
}

const getProgrammesForDropdown = makeAndGetProgrammesForDropdown()

const mapStateToProps = state => ({
    programmes: getProgrammesForDropdown(state)
})

const mapDispatchToProps = dispatch => ({
    saveCouncilMeeting(data) {
        dispatch(saveCouncilmeeting(data))
    },
    updateCouncilMeeting(data) {
        dispatch(updateCouncilmeeting(data))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(CouncilMeetingDetails)