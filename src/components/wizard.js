import React, { useState, useEffect } from 'react';
import StepWizard from "react-step-wizard";
import ReactDataGrid, { SelectColumn, TextEditor } from "react-data-grid";
import Papa from "papaparse";

import "react-data-grid/dist/react-data-grid.css";

import Nav from './nav';

import styles from './wizard.scss';
import transitions from './transitions.scss';
import NimbleInstitutionsAPI from '../models/NimbleInstitutionsAPI.js';

const columns = [
    { key: "name", name: "Name", editable: true, editor: TextEditor },
    { key: "email", name: "Email address", editable: true, editor: TextEditor },
    { key: "cell", name: "Cell number", editable: true, editor: TextEditor },
    { key: "department", name: "Department", editable: true, editor: TextEditor },
    { key: "title", name: "Title", editable: true, editor: TextEditor },
    { key: "role", name: "Role", editable: true, editor: TextEditor }
  ];
  
  const dummyRows = [
    {
        "name": "",
        "email": "",
        "cell": "",
        "department": "",
        "title": "",
        "role": ""
    }
  ];

  const defaultParsePaste = str => str.split(/\r\n|\n|\r/).map(row => row.split("\t"));

/**
 * A basic demonstration of how to use the step wizard
 */
const Wizard = () => {
    const [state, updateState] = useState({
        form: {},
        transitions: {
            enterRight: `${transitions.animated} ${transitions.enterRight}`,
            enterLeft: `${transitions.animated} ${transitions.enterLeft}`,
            exitRight: `${transitions.animated} ${transitions.exitRight}`,
            exitLeft: `${transitions.animated} ${transitions.exitLeft}`,
            intro: `${transitions.animated} ${transitions.intro}`,
        },
        demo: true, // uncomment to see more
    });

    const updateForm = (key, value) => {
        const { form } = state;

        form[key] = value;
        updateState({
            ...state,
            form,
        });
    };

    // Do something on step change
    const onStepChange = (stats) => {
        // console.log(stats);
    };

    return (
        <div className="row d-flex vh-100 align-items-center justify-content-center">
            <div className="" style={{
                width: '100%',
                height: '100%',
                maxWidth: '800px',
                maxHeight: '480px',
                padding: '15px',
            }}>
                <div className={`col`}>
                    <div className="d-flex justify-content-center">
                        <img src="https://www.nimblefi.com/wp-content/themes/nimblefitheme/assets/images/logo.png" className="img-fluid" alt="Nimblefi Logo" />
                    </div>
                    <StepWizard
                        onStepChange={onStepChange}
                        transitions={state.transitions} // comment out for default transitions
                        nav={<Nav />}
                    >
                        <First form={state.form} update={updateForm} />
                        <Second form={state.form} update={updateForm} />
                        <Third form={state.form} update={updateForm} />
                        <Fourth form={state.form} update={updateForm} />
                    </StepWizard>
                </div>
            </div>
        </div>
    );
};

export default Wizard;

/**
 * Stats Component - to illustrate the possible functions
 * Could be used for nav buttons or overview
 */
const Stats = ({
    currentStep,
    firstStep,
    goToStep,
    lastStep,
    nextStep,
    previousStep,
    totalSteps,
    step,
}) => (
    <div className="text-center">
        <hr />
        { step > 1 &&
            <button className='btn btn-default btn-block' onClick={previousStep}>Go Back</button>
        }
        { step < totalSteps ?
            <button className='btn btn-primary btn-block' onClick={nextStep}>Continue</button>
            :
            <button className='btn btn-success btn-block' onClick={nextStep}>Finish</button>
        }
    </div>
);

/** Steps */

const First = props => {

    const [state, updateState] = useState({
        errorMessage: '',
        isLoading: false,
    });

    const update = (e) => {
        props.update(e.target.name, e.target.value);
    };

    const validate = async () => {
        if(props.form.email && props.form.email.split('@')){
            updateState({isLoading: true});
            try {
                let domainMeta = await new NimbleInstitutionsAPI().getDomainMeta(props.form.email.split('@')[1]);
                props.update('domainMeta', domainMeta);
                console.log(domainMeta);
                updateState({isLoading: false});
                props.nextStep();
            } catch (error) {
                updateState({errorMessage: error.message, isLoading: false});
            }
        }
    };

    return (
        <div>
            <div className="input-group has-validation mb-3">
                <input type="email" className={`form-control ${state.errorMessage ? 'is-invalid' : ''}`} id="email" name="email" placeholder="Enter email" aria-label="Enter email" onChange={update} />
                <button className="btn btn-primary" type="button" disabled={state.isLoading} onClick={validate}>{state.isLoading ? `Verifying...` : `Continue`}</button>
                <div className="invalid-feedback">{state.errorMessage}</div>
            </div>
        </div>
    );
};

const Second = props => {

    const [state, updateState] = useState({
        errorMessage: '',
        isLoading: false,
    });

    const getBranches = async () => {
        if(props.form.domainMeta && props.form.domainMeta.url){
            updateState({isLoading: true});
            try {
                let branches = await new NimbleInstitutionsAPI().getBraches(props.form.domainMeta.url);
                props.update('branches', branches);
                console.log(branches);
                updateState({isLoading: false});
                props.nextStep();
            } catch (error) {
                console.log(error);
                updateState({errorMessage: error.message, isLoading: false});
            }
        }
    };

    return (
        <div>
            <h5 className="text-center">Confirm Bank details</h5>
            { props.form.domainMeta && 
            <div className="text-center">
                <img alt={props.form.domainMeta.name} src={`https://logo.clearbit.com/${props.form.domainMeta.url}`} />
                <p>{props.form.domainMeta.name}</p>
                <p>{props.form.domainMeta.address1}, {props.form.domainMeta.city} {props.form.domainMeta.st}, {props.form.domainMeta.zipCode}</p>
                <p>RSSD ID: {props.form.domainMeta.idrssd}; ABA number: {props.form.domainMeta.abaRouting}</p>
            </div>}
            <div className="text-center">
                <hr />
                <button className='btn btn-default btn-block' onClick={props.previousStep}>Go Back</button>
                <button className='btn btn-primary btn-block' onClick={getBranches} disabled={state.isLoading}>{state.isLoading ? `Verifying...` : `Continue`}</button>
            </div>
        </div>
    );
};

const Third = props => {

    const [state, updateState] = useState({
        errorMessage: '',
        isLoading: false,
        brId: 0,
        brLocation: ''
    });

    const update = (e) => {
        updateState({brId: e.target.value, brLocation: e.target.name});
    };

    const setBranch = () => {
        props.update('branch', state.brId);
        props.nextStep();
    }

    return (
        <div>
            <h5>Select your branch: {state.brLocation}</h5>
            { props.form.branches && 
                <div style={{height: 240, overflow: 'scroll', borderTop: '1px solid rgba(0,0,0,.125)', borderBottom: '1px solid rgba(0,0,0,.125)', borderRadius: '0.25rem'}}>
                    <div className="list-group">
                        {props.form.branches.map((branch) =>
                            <button key={branch.brId} name={branch.brLocation} value={branch.brId} type="button" className={`list-group-item list-group-item-action ${state.brId == branch.brId ? 'active' : ''}`} onClick={update}>{branch.brLocation} <span className="badge rounded-pill bg-secondary"># {branch.brId}</span></button>
                        )}
                    </div>
                </div>}
                <div className="text-center my-3">
                    <button className='btn btn-default btn-block' onClick={props.previousStep}>Go Back</button>
                    <button className='btn btn-primary btn-block' onClick={setBranch} disabled={state.isLoading || state.brLocation === ''}>{state.isLoading ? `Verifying...` : `Continue`}</button>
                </div>
        </div>
    );
};

const Progress = (props) => {
    const [state, updateState] = useState({
        isActiveClass: '',
        timeout: null,
    });

    useEffect(() => {
        const { timeout } = state;

        if (props.isActive && !timeout) {
            updateState({
                isActiveClass: styles.loaded,
                timeout: setTimeout(() => {
                    props.nextStep();
                }, 3000),
            });
        } else if (!props.isActive && timeout) {
            clearTimeout(timeout);
            updateState({
                isActiveClass: '',
                timeout: null,
            });
        }
    });

    return (
        <div className={styles['progress-wrapper']}>
            <p className='text-center'>Automated Progress...</p>
            <div className={`${styles.progress} ${state.isActiveClass}`}>
                <div className={`${styles['progress-bar']} progress-bar-striped`} />
            </div>
        </div>
    );
};

const Fourth = (props) => {

    const [rows, setRows] = useState(dummyRows);
    const [state, updateState] = useState({
        topLeft: {},
        header: false
    });

    const submit = () => {
        alert('You did it! Yay!') // eslint-disable-line
    };

    useEffect(() => {
        window.addEventListener('paste', handlePaste);
      
        return () => {
          window.removeEventListener('paste', handlePaste);
        };
      }, [state]);

    const setSelection = (rowIdx, colIdx) => {
        updateState({
            topLeft: {
              rowIdx,
              colIdx
            }
        });
    }

    const handlePaste = (e) => {
        e.preventDefault();
        const { topLeft } = state;
    
        const newRows = [];
        const pasteData = defaultParsePaste(e.clipboardData.getData("text/plain"));

        pasteData.forEach(row => {
          const rowData = {};
          // Merge the values from pasting and the keys from the columns
          columns
            .slice(topLeft.colIdx, topLeft.colIdx + row.length)
            .forEach((col, j) => {
              // Create the key-value pair for the row
              rowData[col.key] = row[j];
            });
          // Push the new row to the changes
          newRows.push(rowData);
        });

        let upperRows = rows.slice(0, topLeft.rowIdx);
    
        setRows([...upperRows, ...newRows]);
    }

    const parseHandler = (results, file) => {
        console.log("Parsing complete:", results, file);
        if(results.data.length === 0){
            return;
        }
        if(state.header){
            setRows(results.data); 
        } else {
            let dataWithHeaders = [];
            results.data.forEach(row => {
                let record = {}
                record.name = row[0] ? row[0] : '';
                record.email = row[1] ? row[1] : '';
                record.cell = row[2] ? row[2] : '';
                record.department = row[3] ? row[3] : '';
                record.title = row[4] ? row[4] : '';
                record.role = row[5] ? row[5] : '';
                dataWithHeaders.push(record);
            });
            setRows(dataWithHeaders); 
        }
    }

    return (
        <div>
            <h5>Import branch admin users</h5>
            <div className="input-group mb-3">
                <div className="input-group-text">
                    <input className="form-check-input mt-0" type="checkbox" id="headers-checkbox" defaultChecked={state.header} onChange={() => updateState({header: !state.header})} />
                    <label className="form-check-label ms-1" htmlFor="headers-checkbox">CSV has headers</label>
                </div>
                <input type="file" className="form-control" accept=".csv" onChange={(event)=> { 
                Papa.parse(event.target.files[0], {
                    complete: parseHandler,
                    skipEmptyLines: true,
                    header: state.header
                });
                }}/>
            </div>
            <ReactDataGrid
                columns={columns} 
                rows={rows} 
                rowsCount={1}
                style={{height: 280}}
                onRowsChange={setRows}
                enableCellSelect={true}
                onRowClick={(rowIdx, row, column) => setSelection(rowIdx, column.idx)}
            />
            <div className="text-center my-3">
                <button className='btn btn-default btn-block' onClick={props.previousStep}>Go Back</button>
                <button className='btn btn-primary btn-block' onClick={() => alert('Work in progress...')} >Continue</button>
            </div>
        </div>
    );
};
