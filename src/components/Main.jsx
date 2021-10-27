import { LineChartOutlined } from "@ant-design/icons";
import { Line } from '@ant-design/charts';
import { Modal, Table } from 'antd';
import { useEffect, useState } from "react";
import { formatTimestamp } from "../utils/time";

export default function Main(){

    const [cryptos, setCryptos] = useState([]);

    useEffect( async () => {

        //TODO: GET cryptos from database
        setCryptos([
            {
                position: 1,
                name: "Bitcoin",
                averages: {
                    minute: 1,
                    hour: 2,
                    day: 3
                },
                metrics: [
                    { timestamp: 1635365081, price: 1},
                    { timestamp: 1635365082, price: 3},
                    { timestamp: 1635365083, price: 2},
                    { timestamp: 1635365084, price: 4},
                    { timestamp: 1635365085, price: 5},
                    { timestamp: 1635365086, price: 4},
                    { timestamp: 1635365087, price: 7},
                    { timestamp: 1635365088, price: 6},
                    { timestamp: 1635365089, price: 9},
                ].map( _metric => { 
                    return { 
                        timestamp: formatTimestamp(_metric.timestamp),
                        price: _metric.price
                    }
                })
            },
            {
                position: 2,
                name: "Etherium",
                averages: {
                    minute: 2,
                    hour: 3,
                    day: 4
                },
                metrics: [
                    { timestamp: 1635365081, price: 4},
                    { timestamp: 1635365082, price: 2},
                    { timestamp: 1635365083, price: 2},
                    { timestamp: 1635365084, price: 4},
                    { timestamp: 1635365085, price: 3},
                    { timestamp: 1635365086, price: 6},
                    { timestamp: 1635365087, price: 7},
                    { timestamp: 1635365088, price: 9},
                    { timestamp: 1635365089, price: 8},
                ].map( _metric => { 
                    return { 
                        timestamp: formatTimestamp(_metric.timestamp),
                        price: _metric.price
                    }
                })
            },
        ])
        
    }, []);

    const Header = ()=> (
        <div className="cnt-2 bgc-theme"> 
            <p className="fnt-3">Artur Vardanyan's Crypto Visualization</p>
        </div>
    )


    const Content = ()=> {
        
        const [modalInfo, setModalInfo] = useState(null);
        
        const graphConfig = {
            data: modalInfo?.metrics,
            height: 250,
            xField: 'timestamp',
            yField: 'price',
            point: {
                size: 5,
                shape: 'diamond',
            },
        };

        const ExtraInfo = () => (<>
            <Modal
                width={700}
                title={`${modalInfo && modalInfo.name} Graph`}
                visible={modalInfo}
                onCancel={()=>{
                    setModalInfo(false)
                }}
                footer={null}
                destroyOnClose
            >
                { modalInfo &&(<>
                    <span className="flex fnt-center">
                        <div className="flex fjss w38">
                            <div className="marginL-2">
                                <h4>Position</h4>
                                <p>{modalInfo.position}</p>
                            </div>
                        </div>
                        <div>
                            <h4>Averages</h4>
                            <div className="flex">
                                <div className="padding-1">
                                    <p>Minutes</p>
                                    <p>{modalInfo.averages.minute}</p>
                                </div>
                                <div className="padding-1">
                                    <p>Hours</p>
                                    <p>{modalInfo.averages.hour}</p>
                                </div>
                                <div className="padding-1">
                                    <p>Days</p>
                                    <p>{modalInfo.averages.day}</p>
                                </div>
                            </div>
                        </div>
                    </span>
                    <span className="w80">
                        <Line {...graphConfig} />
                    </span>
                    
                </>)
                }

            </Modal>
        </>)
    
        const columns = [
            {
                key:'position',
                title:'Position',
                dataIndex:'position'
            },
            {
                key:'name',
                title:'Name',
                dataIndex:'name'
            },
            {
                key:'avgMin',
                title:'Minutes (avg)',
                dataIndex:'averages',
                render: (averages)=> <span className="fnt-center">{averages.minute}</span>
            },
            {
                key:'avgHour',
                title:'Hours (avg)',
                dataIndex:'averages',
                render: (averages)=> <span className="fnt-center">{averages.hour}</span>
            },
            {
                key:'avgDay',
                title:'days (avg)',
                dataIndex:'averages',
                render: (averages)=> <span className="fnt-center">{averages.day}</span>
            },
            {
                key:'actions',
                title:'Actions',
                render: ( _data ) => {
                    return <LineChartOutlined 
                        onClick={ ()=>{
                            setModalInfo(_data);
                            // console.log( "_data", `(${typeof _data}): `, _data);
                        }}
                    />
                }
            },
    
        ]
    

        return (
            <div className="padding-2 bgc-purple flex-row-center flex-col-center">
                <ExtraInfo/>
                <Table 
                    className="fnt-center"
                    rowKey={ _x => _x.name}
                    columns={ columns } 
                    dataSource={cryptos} 
                    pagination={{
                        total:( cryptos.length ),
                        pageSizeOptions: [10, 20, 50, 100],
                        defaultPageSize: 100,
                        showSizeChanger: true,
                        hideOnSinglePage: false,
                    }} 
                />
            </div>
        )
    }

    return (
        <div className="body bgc-theme">

            <Header/>
            <Content/>
            
        </div>
    )

}