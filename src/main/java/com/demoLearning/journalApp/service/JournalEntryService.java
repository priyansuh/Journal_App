package com.demoLearning.journalApp.service;

import com.demoLearning.journalApp.entity.User;
import com.demoLearning.journalApp.entity.journalEntry;
import com.demoLearning.journalApp.repository.JournalEntryRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class JournalEntryService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private UserService userService;

    public void saveEntry(journalEntry journalEntry) {
        journalEntryRepository.save(journalEntry);
    }

    public List<journalEntry> getAll(){
        return journalEntryRepository.findAll();
    }

    public Optional<journalEntry> findById(ObjectId id){
        return journalEntryRepository.findById(id);
    }

    public void deleteById(ObjectId id, String userName){
        User user = userService.findByUserName(userName);
        if (user != null && user.getJournalEntries() != null) {
            user.getJournalEntries().removeIf(x -> x.getId() != null && x.getId().equals(id));
            userService.saveEntry(user);
        }
        journalEntryRepository.deleteById(id);
    }
}
