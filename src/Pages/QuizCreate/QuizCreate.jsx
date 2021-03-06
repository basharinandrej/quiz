import React from 'react'
import './QuizCreate.css'
import MainForm from "../../Components/MainForm/MainForm";
import Input from "../../UI/Input/Input";
import {Auxiliary} from "../../hoc/Auxiliary/Auxiliary";
import Select from "../../UI/Select/Select";
import Button from "../../UI/Button/Button";
import {createControl, isValidateControl} from "../../helpers/formHelpers";
import axios from "axios";
import {baseUrl} from "../../helpers/baseUrl";


const createOptionControl = (number) => {
    return createControl({
        label: `Вариант ${number}`
    }, {required: true})
}

const createFormControls = () => {
    return {
        question: createControl({
            label: 'Введите вопрос',
            placeholder: 'Какая фамилия у Пушкина ?',
            errorMessage: 'Заполните поле'
        }, {required: true}),
        option1: createOptionControl(1),
        option2: createOptionControl(2),
        option3: createOptionControl(3),
        option4: createOptionControl(4),
    }
}

class QuizCreate extends React.Component {

    state = {
        quiz: [],
        isFormValid: false,
        isFormSubmitted: false,
        rightAnswerId: 1,
        formControls: createFormControls()
    }

    isFormValid() {
        const formControls = {...this.state.formControls}
        let isFormValid = true

        Object.keys(formControls).forEach(controlName => {
            isFormValid = formControls[controlName].valid && isFormValid
        })

        this.setState({
            isFormValid
        })
    }

    onChangeHandler(value, controlName) {
        const formControls = {...this.state.formControls}
        const control = formControls[controlName]

        control.value = value
        control.dirty = true
        control.valid = isValidateControl(control.value, control)

        formControls[controlName] = control

        this.isFormValid()

        this.setState({
            formControls
        })
    }

    renderInputs() {
        const formControls = {...this.state.formControls}
        const {isFormValid, isFormSubmitted} = { ...this.state }

        return Object.keys(formControls).map((controlName, idx) => {
            const control = formControls[controlName]

            return (
                <Auxiliary key={control.label + idx} >
                    <Input
                        value={control.value}
                        type={control.typeInput}
                        errorMessage={control.errorMessage}
                        label={control.label}
                        placeholder={control.placeholder}
                        valid={control.valid}
                        dirty={control.dirty}
                        shouldValidate={!!control.validation}
                        isFormValid={isFormValid}
                        isFormSubmitted={isFormSubmitted}
                        onChange={e => this.onChangeHandler(e.target.value, controlName)}
                    />
                    {idx === 0 ? <hr/> : null}

                </Auxiliary>
            )
        })
    }

    onChangeSelectHandler(e) {
        let rightAnswerId = +e.target.value

        this.setState({
            rightAnswerId
        })
    }

    addQuestionHandler(e) {
        e.preventDefault()
        const quiz = this.state.quiz.concat()
        const {question, option1, option2, option3, option4} = this.state.formControls

        if(this.state.isFormValid) {
            const questionItem = {
                id: quiz.length + 1,
                question: question.value,
                rightAnswerId: this.state.rightAnswerId,
                answers: [
                    {id: 1, text: option1.value},
                    {id: 2, text: option2.value},
                    {id: 3, text: option3.value},
                    {id: 4, text: option4.value},
                ]
            }
            quiz.push(questionItem)

            this.setState({
                quiz,
                isFormValid: false,
                isFormSubmitted: false,
                rightAnswerId: 1,
                formControls: createFormControls()
            })

            console.log('Добавил')
        } else {
            this.setState({
                isFormSubmitted: true
            })
            console.log('Не добавил')
        }
    }

    async onSendHandler(e) {
        e.preventDefault()

        try {
            await axios.post(`${baseUrl}/quizes.json`, this.state.quiz)

            this.setState({
                quiz: [],
                isFormValid: false,
                isFormSubmitted: false,
                rightAnswerId: 1,
                formControls: createFormControls()
            })
        } catch (e) {
            console.log('Error in Method onSendHandler', e)
        }
    }

    render() {
        const select = (
            <Select
                label="Выберите правельный ответ"
                value={this.state.rightAnswerId}
                options={[
                    {id: 1, text: 'Вариант 1'},
                    {id: 2, text: 'Вариант 2'},
                    {id: 3, text: 'Вариант 3'},
                    {id: 4, text: 'Вариант 4'},
                ]}
                onChange={e => this.onChangeSelectHandler(e)}
            />
        )

        return (
            <div className="quiz-create">
                <div className="container">
                    <h1 className="quiz-create__title">QuizCreate</h1>

                    <MainForm>
                        { this.renderInputs() }

                        { select }

                        <Button
                            onClick={this.addQuestionHandler.bind(this)}
                            typeButton="primary"
                        >
                            Добавить вопрос
                        </Button>
                        <Button
                            onClick={this.onSendHandler.bind(this)}
                            typeButton="success"
                            disabled={!this.state.quiz.length}
                        >
                            Отправить тест
                        </Button>
                    </MainForm>
                </div>
            </div>
        )
    }
}

export default QuizCreate
