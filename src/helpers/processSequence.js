/**
 * @file Домашка по FP ч. 2
 *
 * Подсказки:
 * Метод get у инстанса Api – каррированый
 * GET / https://animals.tech/{id}
 *
 * GET / https://api.tech/numbers/base
 * params:
 * – number [Int] – число
 * – from [Int] – из какой системы счисления
 * – to [Int] – в какую систему счисления
 *
 * Иногда промисы от API будут приходить в состояние rejected, (прямо как и API в реальной жизни)
 * Ответ будет приходить в поле {result}
 */
 import Api from '../tools/api';
 import * as ramda from 'ramda'
 import {pipe, lt, gt} from 'ramda'
 const api = new Api();

 //валидация

 const isLessThan10 = pipe(ramda.split(''), ramda.length, gt(10));
 const isMoreThan2 = pipe(ramda.split(''), ramda.length, lt(2));
 const isPositiveNum  = pipe(ramda.startsWith('-'), ramda.not)
 const isNumber = pipe(ramda.add(0), ramda.type, ramda.equals('Number'));
 const validate = ramda.allPass([isLessThan10, isMoreThan2, isPositiveNum, isNumber]);

 //преобразования
 const toNumber = ramda.pipe(parseFloat, Math.round);
 const square = (value) => value ** 2;
 const modulo3 = (num) => ramda.modulo(num, 3)

 const params = (number) => ({
   from: 10,
   to: 2,
   number,
 });

 const getNumber = (number) =>
    api.get('https://api.tech/numbers/base', params(number))
     
  
  const getAnimal = (id) =>
    api.get(`https://animals.tech/${id}`, id)


 const processSequence = ({value, writeLog, handleSuccess, handleError}) => {
     
    const tapWriteLog =(val) => ramda.tap(writeLog, val); 
    const handleValidationError = () => handleError('ValidationError');
   
    const processGetAnimal = ramda.pipe(
       tapWriteLog,
       ramda.length,
       tapWriteLog,
       square,
       tapWriteLog,
       modulo3,
       tapWriteLog,
       getAnimal, 
       ramda.otherwise(handleError),
       ramda.andThen(
           ramda.when(ramda.has('result'),
           pipe(ramda.prop('result'), handleSuccess)
           )
       )
   )
   
    const processRequests = pipe (
       toNumber,
       getNumber,
       ramda.otherwise(handleError),
       ramda.andThen(
           ramda.when(ramda.has('result'),
           pipe(ramda.prop('result'), processGetAnimal)
           )
       )
   )
   
    const processValue = ramda.pipe(tapWriteLog,
      ramda.ifElse(validate, processRequests, handleValidationError)
      );
   
    processValue(value);
}

export default processSequence;
