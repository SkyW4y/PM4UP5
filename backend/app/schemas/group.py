from pydantic import BaseModel, ConfigDict
from typing import Optional


class GroupBase(BaseModel):
    name: str


class GroupCreate(GroupBase):
    leader_id: Optional[int] = None


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    leader_id: Optional[int] = None


class GroupShort(GroupBase):
    id: int

    model_config = ConfigDict(from_attributes=True)



class GroupFull(GroupShort):
    leader_id: Optional[int] = None
    # leader: Optional["UserShort"] = None 

    model_config = ConfigDict(from_attributes=True)