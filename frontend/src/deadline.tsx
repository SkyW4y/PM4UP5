import { useState } from 'react'
import './deadline.css'
import './font.css'

function Deadline(){
    const [task, setTask] = useState<any[]>([]) 
    const [inputValue, setInputValue] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const addDeadline = () => {
        setIsModalOpen(true)
    }
    const createTask = () => {
        if (inputValue.trim() === '') {
            alert('Введите название задачи')
            return
        }
        const newTaskObj = {
            id: Date.now(),
            title: inputValue,
            completed: false,
            createdAt: new Date().toISOString()
        }
        setTask([...task, newTaskObj])
        setInputValue('')
        setIsModalOpen(false)
        console.log('Задача добавлена:', newTaskObj)
        console.log('Все задачи:', [...task, newTaskObj])
    }
    
    return(
        <>
 {isModalOpen && (
                <div className='modal'>
                    <input 
                        className='input_Name' 
                        type="text" 
                        placeholder='имя'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button onClick={createTask}>Создать</button>
                    <button onClick={() => setIsModalOpen(false)}>Отмена</button>
                </div>
            )}
        <div className='deadline_wrapper'>
            <div className='h_deadline'>
                <p>Ближайшие дедлайны <span className='add_btn' onClick={addDeadline}>+</span></p>
                {task.map(task=>{
                    return(
                        <p>{task.title}</p>
                    )
                })}
            </div>
        </div>
        </>
    )
}

export default Deadline