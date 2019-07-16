import React, { Component } from 'react';
import { FaChevronDown } from 'react-icons/fa'
import { MdMenu } from 'react-icons/md'
import { MdSearch } from 'react-icons/md'
import { MdEject } from 'react-icons/md'
import SideBarOption from './SideBarOption';
import {get , last , differenceBy} from 'lodash';
import {createChatNameFromUsers} from '../../Factories';
export default class SideBar extends Component{
	static type={
		CHATS : "chats",
		USERS : "users"
	}
    constructor(props){
	   super(props)
	   this.state={
		   receiver:"",
		   activeSideBar:SideBar.type.CHATS
	   };

	}


	handleSubmit = (e)=>{
		e.preventDefault();
		const {receiver}=this.state;
		const {onSendPrivateMessage} = this.props
		onSendPrivateMessage(receiver);
		this.setState({receiver:""});
	}


	addChatForUser = (username)=>{
		console.log("OYEEE");
		this.props.onSendPrivateMessage(username);
		this.setActiveSideBar(SideBar.type.CHATS);
	}

	setActiveSideBar = (newSideBar) =>{
		this.setState({activeSideBar : newSideBar})

	}
	render(){
		const { chats, activeChat, user, setActiveChat, logout, users} = this.props
		const {receiver , activeSideBar} = this.state;
		return (
			<div id="side-bar">
					<div className="heading">
						<div className="app-name">Our Cool Chat <FaChevronDown /></div>
						<div className="menu">
							<MdMenu />
						</div>
					</div>
					<form onSubmit={this.handleSubmit} className="search">
						<i className="search-icon"><MdSearch /></i>
						<input placeholder="Search" type="text" value={receiver} onChange={(e)=>{this.setState({receiver:e.target.value})}}/>
						<div className="plus"></div>
					</form>
					<div className="side-bar-select">
						<div className={`side-bar-select__option ${(activeSideBar===SideBar.type.CHATS) ? 'active' : ''}`}
						      onClick={()=>{this.setActiveSideBar(SideBar.type.CHATS)}}>
								  <span>Chats</span>
							  </div>
							
					    <div className={`side-bar-select__option ${(activeSideBar===SideBar.type.USERS) ? 'active' : ''}`}
						      onClick={()=>{this.setActiveSideBar(SideBar.type.USERS)}}>
								  <span>Users</span>
							  </div>
					</div>
					<div 
						className="users" 
						ref='users' 
						onClick={(e)=>{ (e.target === this.refs.user) && setActiveChat(null) }}>
						
						{
							(activeSideBar===SideBar.type.CHATS) ?
						chats.map((chat)=>{
							

								return(
								<SideBarOption  
									key = {chat.id}
									name={chat.isCommunity ? chat.name : createChatNameFromUsers(chat.users,user.name)}
									lastMessage={get(last(chat.messages),'message','')}
									active = {activeChat.id===chat.id}
									onClick={()=>{this.props.setActiveChat(chat)}}/>
							)
							

							
						})	:

						
					
							differenceBy(users,[user],'name').map((otherUser)=>{
								return (
									<SideBarOption
									   key={otherUser.id}
									   name={otherUser.name}
									   onClick={()=>{this.addChatForUser(otherUser.name)}}/>
								)

							})

							
						}
						
					</div>
					<div className="current-user">
						<span>{user.name}</span>
						<div onClick={()=>{logout()}} title="Logout" className="logout">
							<MdEject/>	
						</div>
					</div>
			</div>
		);
	
	}
}
