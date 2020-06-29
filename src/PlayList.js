import React from "react";
import Table from "react-responsive-data-table";
import url from "./apiConfig";

export default class PlayList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            librarySongs: [],
            playList:[],
            playListError: null,
            playlistValue: '',
            playlistId: '',
            tableData: {
              head:{ album: "Album",
              duration: "Duration",
              title: "Title",
              id: "Id",
              artist: "Artist"
              },
              data:[]
            },
            show : false,
            selectedRows:{},
            showSelectField: false,
            pickFavouritelistId: "",
            pickFavouriteList:''
        };
    }

    componentDidMount(){
        this.libraryList();
        this.getPlayList();
    }

    getPlayList(){
      fetch(url + "playlist")
      .then(result => result.json())
      .then(
        (result) => {
          result.push({"id":"create","name":"Create New Playlist"});
          this.setState({
            playList: result
          });
        },
        (error) => {
          this.setState({
            playListError: error
          });
        }
      )
    }

    libraryList(){
      fetch(url + "library")
      .then(result => result.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            librarySongs: result,
            tableData: {
              head: this.state.tableData.head,
              data : result
            }
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
    }

    renderRowClick = (rowdata) => {
       this.setState({
         show: true,
         selectedRows : rowdata
       });
    }

    handleChange = (event) => {
      var value = this.state.playList.filter(function(item) {
        return (event.target.value === item.name)
      })
      this.setState({
        playlistValue : event.target.value,
        playlistId : value[0].id
      },()=> {
        let songList = value[0].songs;
        let libraySongList = [...this.state.librarySongs];
        let itemList = [];
        songList.filter((value) => {
          libraySongList.forEach(item => {
            if(item.id === value) {
                itemList.push(item);
            };
          });    
        });

        this.setState({
          tableData : {
            head: this.state.tableData.head,
            data : []
          }
        },()=> 
          this.setState({tableData: {
          head: this.state.tableData.head,
          data:itemList
        }})
        );
      });
    }

    showModal = () => {
      this.setState({ show: true });
    };
  
    hideModal = () => {
      this.setState({ show: false ,pickFavouritelistId : '', pickFavouriteList : ''});
    };

    addPlayList = () => {
        this.setState({
          showSelectField : true
        });
    }

    handlePlayList = (event) => {
      var value = this.state.playList.filter(function(item) {
        return (event.target.value === item.name) && item.id
      })
      this.setState({
        pickFavouriteList : event.target.value,
        pickFavouritelistId : value[0].id
      });
      
      if(value[0].id !== "create"){
        this.savePlaylistApi(value[0].id,value[0].name,value[0].songs);
      }
    }
  
    savePlaylistApi = (id,name,songlist) => {
      let rowdata = this.state.selectedRows;
      let apiUrl = url + "playlist";
        let songs = songlist;
        songs.push(rowdata[3]);
        if(id){
          apiUrl = url + 'playlist/' + id;
        }
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name:name, songs: songs})
        };
        fetch(apiUrl, requestOptions)
          .then(async response => {
              const data = await response.json();
              if (!response.ok) {
                  const error = (data && data.message) || response.status;
                  return Promise.reject(error);
              }
              alert("Songs are added successfully");
              this.hideModal();
              this.getPlayList();
          })
          .catch(error => {
              console.error('There was an error!', error);
          });
    }
    addNewList = (event)=> {
      if(event.target.value){
        this.savePlaylistApi("",event.target.value,[]);
      }else{
        alert("Please Enter Playlist Name");
      }
    }
    render(){
        const classValue = this.state.show ? 'modal display-block' : 'modal display-none';
        return(<React.Fragment>
          <React.Fragment>
            <label>
            Pick your favorite PlayList:
            <select value={this.state.playlistValue} onChange={this.handleChange}>
              {this.state.playList.map((item) => 
              <option key={item.id} value={item.name}>{item.name}</option>)
              }
            </select>
          </label>
          </React.Fragment>
          <React.Fragment>
            {this.state.tableData.data.length > 0 && <Table title="PlayList"
            sort={true}
            pages={true}
            size={10}
            search={true}
            pagination={true}
            onRowClick={this.renderRowClick}
            page={true}
            data ={this.state.tableData}></Table>}
          </React.Fragment>
          <React.Fragment>
          <div className={classValue}>
            <section className="modal-main">
              <p><b>Play / Add Playlist</b></p>
              <div>
                <label>Select the Options</label>&nbsp;&nbsp;
                <button>Play</button>&nbsp;&nbsp;
                <button onClick={this.addPlayList}>Add to Playlist</button>
              </div>
              {this.state.showSelectField && <React.Fragment>
              <label>
              Pick your favorite/ create new PlayList:
              <select value={this.state.pickFavouriteList} onChange={this.handlePlayList}>
                {this.state.playList.map((item) => 
                <option key={item.id} value={item.name}>{item.name}</option>)
                }
              </select>
            </label>
            </React.Fragment>}&nbsp;&nbsp;
            {this.state.pickFavouritelistId === "create" && <React.Fragment><input type="text" placeholder="Enter Playlist Name" onBlur={this.addNewList}></input></React.Fragment>}
            &nbsp;&nbsp; <button onClick={this.hideModal}>close</button>
            </section>
            
          </div>
          </React.Fragment>
          </React.Fragment>)
    };
}